import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from problems.crud import get_problem_by_id
from submissions.crud import get_submission_by_id

router = APIRouter(prefix="/ai-hints", tags=["ai-hints"])

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
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "Ты дружелюбный наставник по спортивному программированию. "
                    "Давай подсказки, которые направляют ученика, не раскрывая полное решение. "
                    "Будь поддерживающим и обучающим. "
                    "ОБЯЗАТЕЛЬНО отвечай ТОЛЬКО на русском языке. "
                    "Используй понятные объяснения без лишней воды."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=800,
        temperature=0.5,
    )
    text = response.choices[0].message.content or ""
    tokens = response.usage.total_tokens if response.usage else 0
    return text, tokens


def _build_hint_prompt(hint_type: str, problem: object, code: str | None) -> str:
    prob_info = (
        f"Задача: {problem.title}\n"
        f"Описание: {problem.description}\n"
        f"Входные данные: {problem.input_format}\n"
        f"Выходные данные: {problem.output_format}\n"
        f"Ограничения: {problem.constraints}"
    )
    if hint_type == "algorithm":
        return (
            f"{prob_info}\n\n"
            "Дай подсказку о том, какой алгоритм или структуру данных использовать. "
            "НЕ давай полное решение — только направь мышление в нужную сторону."
        )
    elif hint_type == "approach":
        return (
            f"{prob_info}\n\n"
            "Опиши высокоуровневый подход к решению этой задачи по шагам, "
            "без написания кода."
        )
    elif hint_type == "debug" and code:
        return (
            f"{prob_info}\n\n"
            f"Код ученика:\n```\n{code}\n```\n\n"
            "Помоги найти баг или логическую ошибку, не переписывая решение. "
            "Укажи на проблемное место и объясни, почему оно неправильное."
        )
    elif hint_type == "complexity":
        return (
            f"{prob_info}\n\n"
            "Какая временная и пространственная сложность нужна для прохождения этой задачи? "
            "При какой сложности будет превышен лимит времени или памяти?"
        )
    else:
        return (
            f"{prob_info}\n\n"
            "Дай полезную общую подсказку для решения этой задачи, не раскрывая полное решение."
        )


@router.post("/", response_model=schemas.AIHintResponse, status_code=201)
def request_hint(
    data: schemas.AIHintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem = get_problem_by_id(db, data.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    user_code = None
    if data.submission_id:
        submission = get_submission_by_id(db, data.submission_id)
        if submission:
            user_code = submission.code

    prompt = _build_hint_prompt(data.hint_type, problem, user_code)

    try:
        response_text, tokens = _call_groq(prompt)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq API error: {exc}")

    return crud.create_hint(
        db,
        current_user.id,
        data.problem_id,
        data.hint_type,
        prompt,
        response_text,
        tokens,
        data.submission_id,
    )


@router.get("/problem/{problem_id}", response_model=list[schemas.AIHintResponse])
def get_hints(
    problem_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_hints_by_user_and_problem(db, current_user.id, problem_id)
