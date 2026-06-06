import os
import sys
import subprocess
import tempfile
import time
import uuid
import shutil
from datetime import datetime
from pathlib import Path

# Use a project-local directory for temp files to avoid Windows AppControl policy
# that blocks executing scripts from the system %TEMP% folder.
JUDGE_TMP = Path(__file__).parent.parent / "judge_tmp"
JUDGE_TMP.mkdir(exist_ok=True)


def _normalize(s: str) -> str:
    lines = s.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    lines = [line.rstrip() for line in lines]
    while lines and not lines[-1]:
        lines.pop()
    return '\n'.join(lines)


def _run_python(code: str, input_data: str, time_limit_s: float) -> dict:
    """
    Execute Python code by passing it via -c flag — no temp file needed,
    which avoids Windows Application Control (WDAC/AppLocker) policy blocks.
    """
    try:
        start = time.time()
        proc = subprocess.run(
            [sys.executable, "-c", code],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=time_limit_s,
            encoding="utf-8",
        )
        elapsed_ms = int((time.time() - start) * 1000)
        if proc.returncode != 0:
            stderr = proc.stderr[:2000] if proc.stderr else ""
            return {"status": "runtime_error", "output": "", "error": stderr, "time_ms": elapsed_ms}
        return {"status": "ok", "output": proc.stdout, "error": "", "time_ms": elapsed_ms}
    except subprocess.TimeoutExpired:
        return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    except PermissionError as e:
        return {"status": "system_error", "output": "", "error": f"Permission denied: {e}", "time_ms": 0}
    except Exception as e:
        return {"status": "system_error", "output": "", "error": str(e)[:500], "time_ms": 0}


def _run_cpp(code: str, input_data: str, time_limit_s: float) -> dict:
    if not shutil.which("g++"):
        return {
            "status": "system_error",
            "output": "",
            "error": "g++ not found. Install MinGW/MSYS2 and add to PATH to compile C++.",
            "time_ms": 0,
        }
    # Use project-local judge_tmp instead of system %TEMP% to bypass Windows AppControl
    tmpdir = JUDGE_TMP / uuid.uuid4().hex
    tmpdir.mkdir(exist_ok=True)
    try:
        src = tmpdir / "solution.cpp"
        exe = tmpdir / "solution.exe"
        src.write_text(code, encoding="utf-8")

        compile_proc = subprocess.run(
            ["g++", "-O2", "-std=c++17", "-o", str(exe), str(src)],
            capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            return {"status": "compile_error", "output": "", "error": compile_proc.stderr[:2000], "time_ms": 0}

        start = time.time()
        try:
            proc = subprocess.run(
                [str(exe)],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=time_limit_s,
                encoding="utf-8",
            )
            elapsed_ms = int((time.time() - start) * 1000)
            if proc.returncode != 0:
                return {"status": "runtime_error", "output": "", "error": proc.stderr[:2000], "time_ms": elapsed_ms}
            return {"status": "ok", "output": proc.stdout, "error": "", "time_ms": elapsed_ms}
        except subprocess.TimeoutExpired:
            return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    except PermissionError as e:
        return {"status": "system_error", "output": "", "error": f"Permission denied: {e}", "time_ms": 0}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _run_java(code: str, input_data: str, time_limit_s: float) -> dict:
    if not shutil.which("javac"):
        return {"status": "system_error", "output": "", "error": "javac not found.", "time_ms": 0}
    tmpdir = JUDGE_TMP / uuid.uuid4().hex
    tmpdir.mkdir(exist_ok=True)
    try:
        src = tmpdir / "Solution.java"
        src.write_text(code, encoding="utf-8")
        compile_proc = subprocess.run(
            ["javac", str(src)], capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            return {"status": "compile_error", "output": "", "error": compile_proc.stderr[:2000], "time_ms": 0}
        start = time.time()
        try:
            proc = subprocess.run(
                ["java", "-cp", str(tmpdir), "Solution"],
                input=input_data, capture_output=True, text=True,
                timeout=time_limit_s, encoding="utf-8",
            )
            elapsed_ms = int((time.time() - start) * 1000)
            if proc.returncode != 0:
                return {"status": "runtime_error", "output": "", "error": proc.stderr[:2000], "time_ms": elapsed_ms}
            return {"status": "ok", "output": proc.stdout, "error": "", "time_ms": elapsed_ms}
        except subprocess.TimeoutExpired:
            return {"status": "time_limit", "output": "", "error": "", "time_ms": int(time_limit_s * 1000)}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _execute(language: str, code: str, input_data: str, time_limit_s: float) -> dict:
    lang = language.lower()
    if lang in ("python", "python3", "py"):
        return _run_python(code, input_data, time_limit_s)
    elif lang in ("cpp", "c++", "c"):
        return _run_cpp(code, input_data, time_limit_s)
    elif lang in ("java",):
        return _run_java(code, input_data, time_limit_s)
    else:
        return {
            "status": "system_error",
            "output": "",
            "error": f"Language '{language}' is not supported. Supported: python, cpp, java.",
            "time_ms": 0,
        }


def _ai_analyze_error(
    code: str, language: str, problem_title: str, problem_desc: str,
    status: str, error_message: str, passed_count: int, total_count: int,
) -> str | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        status_ru = {
            "wrong_answer":  "Неправильный ответ",
            "time_limit":    "Превышение лимита времени",
            "runtime_error": "Ошибка выполнения",
            "compile_error": "Ошибка компиляции",
            "system_error":  "Системная ошибка",
        }.get(status, status)

        prompt = (
            f"Задача: {problem_title}\n"
            f"Описание: {problem_desc[:500]}\n\n"
            f"Язык: {language}\n\n"
            f"Код:\n```{language}\n{code[:3000]}\n```\n\n"
            f"Результат: {status_ru}\n"
            f"Пройдено тестов: {passed_count} из {total_count}\n"
        )
        if error_message:
            prompt += f"Ошибка:\n{error_message[:1000]}\n\n"
        prompt += (
            "Объясни что не так и как исправить. "
            "Если Неправильный ответ — найди логическую ошибку. "
            "Если ошибка выполнения — что вызывает сбой. "
            "Если ошибка компиляции — объясни и покажи как исправить."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты помощник по спортивному программированию. "
                        "Объясняй ошибки просто и понятно ТОЛЬКО словами. "
                        "КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать, показывать или предлагать любой код. "
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
        max_score    = sum(tc.score for tc in test_cases) or 1
        total_score  = 0
        max_time_ms  = 0
        final_status = SubmissionStatus.accepted
        first_error: str | None = None
        passed_count = 0

        increment_attempt_count(db, sub.problem_id)

        for tc in test_cases:
            res = _execute(sub.language, sub.code, tc.input_data or "", time_limit_s)
            elapsed_ms = res.get("time_ms", 0)
            max_time_ms = max(max_time_ms, elapsed_ms)
            raw_status  = res["status"]

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
                actual   = _normalize(res["output"])
                if actual == expected:
                    tc_status = ResultStatus.accepted
                    total_score += tc.score
                    passed_count += 1
                else:
                    tc_status = ResultStatus.wrong_answer
                    if final_status == SubmissionStatus.accepted:
                        final_status = SubmissionStatus.wrong_answer
                        first_error  = f"Неправильный ответ на тесте #{tc.order_num + 1}"
            elif raw_status == "time_limit":
                tc_status = ResultStatus.time_limit
                if final_status == SubmissionStatus.accepted:
                    final_status = SubmissionStatus.time_limit
                    first_error  = f"Превышен лимит времени на тесте #{tc.order_num + 1}"
            else:
                tc_status = ResultStatus.runtime_error
                if final_status == SubmissionStatus.accepted:
                    final_status = SubmissionStatus.runtime_error
                    first_error  = res.get("error", "Runtime error")[:500]

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

        solved      = {}
        wrong_count = {}
        for s in all_subs:
            pid = str(s.problem_id)
            if pid in solved:
                continue
            if s.status == SubmissionStatus.accepted:
                solved[pid] = s
            else:
                wrong_count[pid] = wrong_count.get(pid, 0) + 1

        score   = len(solved)
        penalty = 0
        for pid, acc_sub in solved.items():
            sub_time   = acc_sub.created_at.replace(tzinfo=None) if acc_sub.created_at else datetime.utcnow()
            start_time = contest.starts_at.replace(tzinfo=None) if contest.starts_at else sub_time
            delta_min  = int((sub_time - start_time).total_seconds() / 60)
            penalty   += max(0, delta_min) + 20 * wrong_count.get(pid, 0)

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
