import os
import sys
import subprocess
import tempfile
import time
import uuid
import shutil


def _normalize(s: str) -> str:
    return s.strip().replace('\r\n', '\n').replace('\r', '\n')


def _run_python(code: str, input_data: str, time_limit_s: float) -> dict:
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
        f.write(code)
        tmp_path = f.name
    try:
        start = time.time()
        proc = subprocess.run(
            [sys.executable, tmp_path],
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
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


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
    else:
        return {"status": "system_error", "output": "", "error": f"Language '{language}' is not supported yet. Supported: python, cpp.", "time_ms": 0}


def judge_submission(submission_id: uuid.UUID, SessionLocal):
    """Runs in a FastAPI BackgroundTask with its own DB session."""
    db = SessionLocal()
    try:
        from submissions.crud import get_submission_by_id, update_submission_status
        from submissions.models import SubmissionStatus
        from test_cases.crud import get_test_cases_by_problem
        from submission_results.crud import create_result
        from submission_results.models import ResultStatus
        from problems.crud import get_problem_by_id, increment_solve_count, increment_attempt_count

        sub = get_submission_by_id(db, submission_id)
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

        increment_attempt_count(db, sub.problem_id)

        for tc in test_cases:
            res = _execute(sub.language, sub.code, tc.input_data, time_limit_s)
            elapsed_ms = res.get("time_ms", 0)
            max_time_ms = max(max_time_ms, elapsed_ms)

            raw_status = res["status"]

            if raw_status == "compile_error":
                update_submission_status(db, submission_id, SubmissionStatus.compile_error,
                                         error_message=res.get("error", ""))
                return

            if raw_status == "system_error":
                update_submission_status(db, submission_id, SubmissionStatus.system_error,
                                         error_message=res.get("error", ""))
                return

            if raw_status == "ok":
                expected = _normalize(tc.expected_output)
                actual = _normalize(res["output"])
                if actual == expected:
                    tc_status = ResultStatus.accepted
                    total_score += tc.score
                else:
                    tc_status = ResultStatus.wrong_answer
                    if final_status == SubmissionStatus.accepted:
                        final_status = SubmissionStatus.wrong_answer
                        first_error = f"Wrong answer on test #{tc.order_num + 1}"
            elif raw_status == "time_limit":
                tc_status = ResultStatus.time_limit
                if final_status == SubmissionStatus.accepted:
                    final_status = SubmissionStatus.time_limit
                    first_error = f"Time limit exceeded on test #{tc.order_num + 1}"
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
