from sqlalchemy.orm import Session
from .models import AIHint
import uuid

def create_hint(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID,
                hint_type: str, request_prompt: str, response_text: str,
                tokens_used: int, submission_id: uuid.UUID = None):
    db_hint = AIHint(
        user_id=user_id,
        problem_id=problem_id,
        submission_id=submission_id,
        hint_type=hint_type,
        request_prompt=request_prompt,
        response_text=response_text,
        tokens_used=tokens_used
    )
    db.add(db_hint)
    db.commit()
    db.refresh(db_hint)
    return db_hint

def get_hints_by_user_and_problem(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    return db.query(AIHint).filter(
        AIHint.user_id == user_id,
        AIHint.problem_id == problem_id
    ).order_by(AIHint.created_at.desc()).all()

def get_hints_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(AIHint).filter(
        AIHint.user_id == user_id
    ).order_by(AIHint.created_at.desc()).offset(skip).limit(limit).all()