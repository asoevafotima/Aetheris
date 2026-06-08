import os
import sys
import io
import threading
import subprocess
import tempfile
import time
import uuid
import shutil
import traceback
from pathlib import Path
from datetime import datetime

# Serializes in-process Python execution (it swaps global sys.stdin/stdout).
_INPROC_LOCK = threading.Lock()


def _get_python_exe() -> str:
    """
    Return a reliable python.exe path.

    The server may run under a python whose subprocess-spawned children get
    blocked by Windows Smart App Control / WDAC (WinError 4551), especially the
    Microsoft-Store app-exec aliases in %LOCALAPPDATA%\\Microsoft\\WindowsApps.
    A normal venv python.exe is a trusted, signed exe and is never blocked, so
    we prefer it.
    """
    project_root = Path(__file__).parent.parent

    candidates = [
        project_root / ".venv" / "Scripts" / "python.exe",   # Windows venv
        project_root / ".venv" / "bin" / "python",           # POSIX venv
        project_root / "venv" / "Scripts" / "python.exe",
        project_root / "venv" / "bin" / "python",
    ]
    for c in candidates:
        if c.exists():
            return str(c)

    # Fall back to sys.executable unless it is a WindowsApps exec-alias
    exe = sys.executable or ""
    if exe and "WindowsApps" not in exe:
        return exe

    found = shutil.which("python") or shutil.which("python3")
    return found or exe


PYTHON_EXE = _get_python_exe()


def _python_candidates() -> list:
    """Ordered list of python interpreters to try, de-duplicated, skipping
    WindowsApps exec-aliases (those tend to be blocked by Smart App Control)."""
    out = []
    for exe in (PYTHON_EXE, sys.executable):
        if exe and "WindowsApps" not in exe and exe not in out:
            out.append(exe)
    return out


def _utf8_env() -> dict:
    """
    Force child process to use UTF-8 for stdin/stdout so Cyrillic (and any
    non-ASCII) output is decoded correctly. Without this, child Python on
    Windows encodes stdout in the console codepage (cp1251) while we decode
    as UTF-8 -> garbled text / UnicodeDecodeError.
    """
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    return env


def _normalize(s: str) -> str:
    lines = s.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    lines = [line.rstrip() for line in lines]
    while lines and not lines[-1]:
        lines.pop()
    return '\n'.join(lines)


def _run_python_inprocess(code: str, input_data: str, time_limit_s: float) -> dict:
    """
    Execute Python code INSIDE this process via exec(), with stdin/stdout
    redirected. No child process is launched, so Windows Smart App Control
    (WinError 4551) cannot block it. Runs in a worker thread to enforce the
    time limit. Serialized by a lock because it swaps the global sys streams.
    """
    result = {"status": "system_error", "output": "", "error": "", "time_ms": 0}
    buf_out = io.StringIO()
    fake_in = io.StringIO(input_data)

    def target():
        try:
            ns = {"__name__": "__main__"}
            exec(compile(code, "<solution>", "exec"), ns)
            result["status"] = "ok"
            result["error"] = ""
        except SystemExit:
            result["status"] = "ok"
            result["error"] = ""
        except BaseException:
            result["status"] = "runtime_error"
            result["error"] = traceback.format_exc()[:2000]

    # Swap the global streams in THIS thread and always restore them in finally,
    # so a hung (timed-out) worker can never leave the server's stdout broken.
    with _INPROC_LOCK:
        old_in, old_out, old_err = sys.stdin, sys.stdout, sys.stderr
        sys.stdin, sys.stdout, sys.stderr = fake_in, buf_out, io.StringIO()
        try:
            t = threading.Thread(target=target, daemon=True)
            start = time.time()
            t.start()
            t.join(time_limit_s)
            elapsed_ms = int((time.time() - start) * 1000)
        finally:
            sys.stdin, sys.stdout, sys.stderr = old_in, old_out, old_err

    if t.is_alive():
        return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    result["output"] = buf_out.getvalue()
    result["time_ms"] = elapsed_ms
    return result


def _run_python(code: str, input_data: str, time_limit_s: float) -> dict:
    """
    Primary path: run the code as a real subprocess (isolated, with a hard
    timeout). If every interpreter is blocked by Windows Smart App Control
    (WinError 4551 raised as OSError), transparently fall back to in-process
    execution so judging still works on locked-down machines.
    """
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
        f.write(code)
        tmp_path = f.name
    try:
        for exe in _python_candidates():
            try:
                start = time.time()
                proc = subprocess.run(
                    [exe, tmp_path],
                    input=input_data,
                    capture_output=True,
                    text=True,
                    timeout=time_limit_s,
                    encoding="utf-8",
                    errors="replace",
                    env=_utf8_env(),
                )
                elapsed_ms = int((time.time() - start) * 1000)
                if proc.returncode != 0:
                    return {"status": "runtime_error", "output": "", "error": (proc.stderr or "")[:2000], "time_ms": elapsed_ms}
                return {"status": "ok", "output": proc.stdout or "", "error": "", "time_ms": elapsed_ms}
            except subprocess.TimeoutExpired:
                return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
            except OSError:
                # WinError 4551 (App Control blocked the interpreter) — try next.
                continue
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    # All subprocess attempts were blocked — run in-process (immune to App Control).
    return _run_python_inprocess(code, input_data, time_limit_s)


def _run_cpp(code: str, input_data: str, time_limit_s: float) -> dict:
    if not shutil.which("g++"):
        return {"status": "system_error", "output": "", "error": "g++ not found. Install MinGW to compile C++.", "time_ms": 0}
    tmpdir = tempfile.mkdtemp()
    try:
        src = os.path.join(tmpdir, "solution.cpp")
        exe = os.path.join(tmpdir, "solution.exe")
        with open(src, "w", encoding="utf-8") as f:
            f.write(code)
        compile_proc = subprocess.run(
            ["g++", "-O2", "-std=c++17", "-o", exe, src],
            capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            return {"status": "compile_error", "output": "", "error": compile_proc.stderr[:2000], "time_ms": 0}
        start = time.time()
        try:
            proc = subprocess.run(
                [exe],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=time_limit_s,
                encoding="utf-8",
                errors="replace",
            )
            elapsed_ms = int((time.time() - start) * 1000)
            if proc.returncode != 0:
                return {"status": "runtime_error", "output": "", "error": (proc.stderr or "")[:2000], "time_ms": elapsed_ms}
            return {"status": "ok", "output": proc.stdout or "", "error": "", "time_ms": elapsed_ms}
        except subprocess.TimeoutExpired:
            return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _run_c(code: str, input_data: str, time_limit_s: float) -> dict:
    if not shutil.which("gcc"):
        return {"status": "system_error", "output": "", "error": "gcc not found. Install MinGW/MSYS2 to compile C.", "time_ms": 0}
    tmpdir = tempfile.mkdtemp()
    try:
        src = os.path.join(tmpdir, "solution.c")
        exe = os.path.join(tmpdir, "solution.exe")
        with open(src, "w", encoding="utf-8") as f:
            f.write(code)
        compile_proc = subprocess.run(
            ["gcc", "-O2", "-std=c11", "-o", exe, src],
            capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            return {"status": "compile_error", "output": "", "error": compile_proc.stderr[:2000], "time_ms": 0}
        start = time.time()
        try:
            proc = subprocess.run(
                [exe],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=time_limit_s,
                encoding="utf-8",
                errors="replace",
            )
            elapsed_ms = int((time.time() - start) * 1000)
            if proc.returncode != 0:
                return {"status": "runtime_error", "output": "", "error": (proc.stderr or "")[:2000], "time_ms": elapsed_ms}
            return {"status": "ok", "output": proc.stdout or "", "error": "", "time_ms": elapsed_ms}
        except subprocess.TimeoutExpired:
            return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _run_node(code: str, input_data: str, time_limit_s: float) -> dict:
    if not shutil.which("node"):
        return {"status": "system_error", "output": "", "error": "node not found. Install Node.js to run JavaScript.", "time_ms": 0}
    tmpdir = tempfile.mkdtemp()
    try:
        src = os.path.join(tmpdir, "solution.js")
        with open(src, "w", encoding="utf-8") as f:
            f.write(code)
        start = time.time()
        try:
            proc = subprocess.run(
                ["node", src],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=time_limit_s,
                encoding="utf-8",
                errors="replace",
            )
            elapsed_ms = int((time.time() - start) * 1000)
            if proc.returncode != 0:
                return {"status": "runtime_error", "output": "", "error": (proc.stderr or "")[:2000], "time_ms": elapsed_ms}
            return {"status": "ok", "output": proc.stdout or "", "error": "", "time_ms": elapsed_ms}
        except subprocess.TimeoutExpired:
            return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _execute(language: str, code: str, input_data: str, time_limit_s: float) -> dict:
    lang = language.lower()
    if lang in ("python", "python3", "py"):
        return _run_python(code, input_data, time_limit_s)
    elif lang in ("cpp", "c++"):
        return _run_cpp(code, input_data, time_limit_s)
    elif lang in ("c",):
        return _run_c(code, input_data, time_limit_s)
    elif lang in ("javascript", "js", "node", "nodejs"):
        return _run_node(code, input_data, time_limit_s)
    else:
        return {"status": "system_error", "output": "", "error": f"Language '{language}' is not supported yet. Supported: python, cpp, c, javascript.", "time_ms": 0}


def _ai_analyze_error(
    code: str,
    language: str,
    problem_title: str,
    problem_desc: str,
    status: str,
    error_message: str,
    passed_count: int,
    total_count: int,
) -> str | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        status_ru = {
            "wrong_answer": "Неправильный ответ",
            "time_limit": "Превышение лимита времени",
            "runtime_error": "Ошибка выполнения",
            "compile_error": "Ошибка компиляции",
            "system_error": "Системная ошибка",
        }.get(status, status)

        prompt = (
            f"Задача: {problem_title}\n"
            f"Описание задачи: {problem_desc[:500]}\n\n"
            f"Язык: {language}\n\n"
            f"Код ученика:\n```{language}\n{code[:3000]}\n```\n\n"
            f"Результат проверки: {status_ru}\n"
            f"Пройдено тестов: {passed_count} из {total_count}\n"
        )
        if error_message:
            prompt += f"Текст ошибки:\n{error_message[:1000]}\n\n"
        prompt += (
            "Объясни что не так в коде и как это исправить. "
            "Будь конкретным и понятным. Если это Неправильный ответ — найди логическую ошибку. "
            "Если ошибка выполнения — что вызывает сбой. "
            "Если ошибка компиляции — объясни синтаксическую ошибку и как её исправить."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты помощник по спортивному программированию. "
                        "Объясняй ошибки просто и понятно ТОЛЬКО словами. "
                        "КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать, показывать или предлагать любой код — "
                        "ни исправленный, ни примерный, ни фрагменты. "
                        "ОБЯЗАТЕЛЬНО отвечай ТОЛЬКО на русском языке."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=1000,
            temperature=0.3,
        )
        return response.choices[0].message.content or None
    except Exception:
        return None


def judge_submission(submission_id: uuid.UUID, SessionLocal):
    """Runs in a FastAPI BackgroundTask with its own DB session."""
    db = SessionLocal()
    try:
        from submissions.crud import get_submission_by_id, update_submission_status
        from submissions.models import Submission, SubmissionStatus
        from test_cases.crud import get_test_cases_by_problem
        from submission_results.crud import create_result
        from submission_results.models import ResultStatus
        from problems.crud import get_problem_by_id, increment_solve_count, increment_attempt_count

        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            return

        update_submission_status(db, submission_id, SubmissionStatus.running)

        problem = get_problem_by_id(db, sub.problem_id)
        if not problem:
            update_submission_status(db, submission_id, SubmissionStatus.system_error,
                                     error_message="Problem not found")
            return

        test_cases = get_test_cases_by_problem(db, sub.problem_id)
        if not test_cases:
            update_submission_status(db, submission_id, SubmissionStatus.system_error,
                                     error_message="No test cases found for this problem")
            return

        time_limit_s = (problem.time_limit_ms or 2000) / 1000.0
        max_score = sum(tc.score for tc in test_cases) or 1
        total_score = 0
        max_time_ms = 0
        final_status = SubmissionStatus.accepted
        first_error: str | None = None
        passed_count = 0

        increment_attempt_count(db, sub.problem_id)

        for tc in test_cases:
            res = _execute(sub.language, sub.code, tc.input_data or "", time_limit_s)
            elapsed_ms = res.get("time_ms", 0)
            max_time_ms = max(max_time_ms, elapsed_ms)

            raw_status = res["status"]

            if raw_status == "compile_error":
                update_submission_status(db, submission_id, SubmissionStatus.compile_error,
                                         error_message=res.get("error", ""))
                _save_ai_hint(db, sub, SubmissionStatus.compile_error.value, res.get("error", ""),
                              problem, 0, len(test_cases))
                return

            if raw_status == "system_error":
                update_submission_status(db, submission_id, SubmissionStatus.system_error,
                                         error_message=res.get("error", ""))
                return

            if raw_status == "ok":
                expected = _normalize(tc.expected_output or "")
                actual = _normalize(res["output"])
                if actual == expected:
                    tc_status = ResultStatus.accepted
                    total_score += tc.score
                    passed_count += 1
                else:
                    tc_status = ResultStatus.wrong_answer
                    if final_status == SubmissionStatus.accepted:
                        final_status = SubmissionStatus.wrong_answer
                        first_error = f"Неправильный ответ на тесте #{tc.order_num + 1}"
            elif raw_status == "time_limit":
                tc_status = ResultStatus.time_limit
                if final_status == SubmissionStatus.accepted:
                    final_status = SubmissionStatus.time_limit
                    first_error = f"Превышен лимит времени на тесте #{tc.order_num + 1}"
            else:
                tc_status = ResultStatus.runtime_error
                if final_status == SubmissionStatus.accepted:
                    final_status = SubmissionStatus.runtime_error
                    first_error = res.get("error", "Runtime error")[:500]

            create_result(
                db, submission_id, tc.id, tc_status,
                time_ms=elapsed_ms,
                actual_output=res.get("output", "")[:4000],
            )

        score_pct = round(total_score / max_score * 100.0, 2)
        update_submission_status(
            db, submission_id, final_status,
            time_ms=max_time_ms,
            score=score_pct,
            error_message=first_error,
        )

        if final_status == SubmissionStatus.accepted:
            increment_solve_count(db, sub.problem_id)
        else:
            _save_ai_hint(db, sub, final_status.value, first_error or "",
                          problem, passed_count, len(test_cases))

        _update_contest_standings(db, sub)
        _update_duel(db, sub, final_status, score_pct)
        _update_training(db, sub, final_status)

    except Exception as exc:
        try:
            from submissions.crud import update_submission_status
            from submissions.models import SubmissionStatus
            update_submission_status(db, submission_id, SubmissionStatus.system_error,
                                     error_message=str(exc)[:500])
        except Exception:
            pass
    finally:
        db.close()


def _update_duel(db, sub, final_status, score_pct: float):
    try:
        from duels.models import Duel, DuelStatus
        from submissions.models import SubmissionStatus
        duel = db.query(Duel).filter(
            Duel.problem_id == sub.problem_id,
            Duel.status == DuelStatus.active,
            (Duel.challenger_id == sub.user_id) | (Duel.opponent_id == sub.user_id),
        ).first()
        if not duel:
            return
        solved = (final_status == SubmissionStatus.accepted)
        from duels.crud import record_submission
        record_submission(db, duel.id, sub.user_id, solved, score_pct)
    except Exception:
        pass


def _update_training(db, sub, final_status):
    try:
        from submissions.models import SubmissionStatus
        if final_status != SubmissionStatus.accepted:
            return
        from training_plan_items.models import TrainingPlanItem, ItemStatus
        from training_plans.models import TrainingPlan
        item = db.query(TrainingPlanItem).join(
            TrainingPlan, TrainingPlan.id == TrainingPlanItem.plan_id
        ).filter(
            TrainingPlanItem.problem_id == sub.problem_id,
            TrainingPlan.user_id == sub.user_id,
            TrainingPlanItem.status != ItemStatus.completed,
        ).first()
        if item:
            item.status = ItemStatus.completed
            item.completed_at = datetime.utcnow()
            db.commit()
    except Exception:
        pass


def _update_contest_standings(db, sub):
    if not sub.contest_id:
        return
    try:
        from contests.crud import get_contest_by_id
        from contest_standings.crud import upsert_standing, update_ranks
        from submissions.models import Submission, SubmissionStatus

        contest = get_contest_by_id(db, sub.contest_id)
        if not contest:
            return

        finished_statuses = [
            SubmissionStatus.accepted, SubmissionStatus.wrong_answer,
            SubmissionStatus.time_limit, SubmissionStatus.runtime_error,
            SubmissionStatus.compile_error,
        ]
        all_subs = db.query(Submission).filter(
            Submission.contest_id == sub.contest_id,
            Submission.user_id == sub.user_id,
            Submission.status.in_(finished_statuses),
        ).order_by(Submission.created_at).all()

        solved = {}
        wrong_count = {}

        for s in all_subs:
            pid = str(s.problem_id)
            if pid in solved:
                continue
            if s.status == SubmissionStatus.accepted:
                solved[pid] = s
            else:
                wrong_count[pid] = wrong_count.get(pid, 0) + 1

        score = len(solved)
        penalty = 0
        for pid, acc_sub in solved.items():
            sub_time = acc_sub.created_at.replace(tzinfo=None) if acc_sub.created_at else datetime.utcnow()
            start_time = contest.starts_at.replace(tzinfo=None) if contest.starts_at else sub_time
            delta_min = int((sub_time - start_time).total_seconds() / 60)
            penalty += max(0, delta_min) + 20 * wrong_count.get(pid, 0)

        upsert_standing(db, sub.contest_id, sub.user_id, score, penalty)
        update_ranks(db, sub.contest_id)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"standings update failed: {e}")


def _save_ai_hint(db, sub, status: str, error_message: str, problem, passed_count: int, total_count: int):
    hint = _ai_analyze_error(
        code=sub.code,
        language=sub.language,
        problem_title=problem.title if problem else "Unknown",
        problem_desc=problem.description if problem else "",
        status=status,
        error_message=error_message,
        passed_count=passed_count,
        total_count=total_count,
    )
    if hint:
        sub.ai_hint = hint
        db.commit()
