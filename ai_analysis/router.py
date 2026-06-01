import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from submissions.crud import get_submission_by_id
from problems.crud import get_problem_by_id

router = APIRouter(prefix="/ai-analysis", tags=["ai-analysis"])

_groq_client: Groq | None = None


def _get_groq() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def _call_groq(prompt: str) -> tuple[str, int]:
    client = _get_groq()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "Ты эксперт по спортивному программированию и опытный преподаватель. "
                    "Анализируй решения задач чётко и по существу. "
                    "ОБЯЗАТЕЛЬНО отвечай ТОЛЬКО на русском языке. "
                    "Используй простые и понятные объяснения."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=1500,
        temperature=0.3,
    )
    text = response.choices[0].message.content or ""
    tokens = response.usage.total_tokens if response.usage else 0
    return text, tokens


def _build_prompt(analysis_type: str, code: str, language: str, problem_title: str, problem_desc: str) -> str:
    base = f"Задача: {problem_title}\n\nКод ({language}):\n```{language}\n{code}\n```\n\n"
    if analysis_type == "complexity":
        return base + "Проанализируй временную и пространственную сложность. Объясни нотацию O() с обоснованием."
    elif analysis_type == "style":
        return base + "Проверь стиль кода, именование переменных, читаемость. Предложи улучшения."
    elif analysis_type == "correctness":
        return base + (
            f"Описание задачи:\n{problem_desc}\n\n"
            "Проверь корректность решения. Найди возможные баги и граничные случаи, которые могут не работать."
        )
    elif analysis_type == "optimization":
        return base + "Предложи оптимизации для ускорения работы или уменьшения расхода памяти."
    else:
        return base + (
            f"Описание задачи:\n{problem_desc}\n\n"
            "Дай полный анализ: корректность, сложность, стиль кода и предложения по оптимизации."
        )


@router.post("/", response_model=schemas.AIAnalysisResponse, status_code=201)
def request_analysis(
    data: schemas.AIAnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = get_submission_by_id(db, data.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if str(submission.user_id) != str(current_user.id) and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    problem = get_problem_by_id(db, submission.problem_id)
    problem_title = problem.title if problem else "Unknown"
    problem_desc = problem.description if problem else ""

    prompt = _build_prompt(
        data.analysis_type,
        submission.code,
        submission.language,
        problem_title,
        problem_desc,
    )

    try:
        result_text, tokens = _call_groq(prompt)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq API error: {exc}")

    return crud.create_analysis(
        db, current_user.id, data.submission_id, data.analysis_type, result_text, tokens
    )


@router.get("/submission/{submission_id}", response_model=list[schemas.AIAnalysisResponse])
def get_analysis(
    submission_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_analysis_by_submission(db, submission_id)
