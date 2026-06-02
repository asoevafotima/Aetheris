from sqlalchemy.orm import Session
from .models import Submission, SubmissionStatus
from .schemas import SubmissionCreate
import uuid

def create_submission(db: Session, data: SubmissionCreate, user_id: uuid.UUID):
    db_sub = Submission(**data.model_dump(), user_id=user_id)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

def get_submission_by_id(db: Session, submission_id: uuid.UUID):
    from sqlalchemy.orm import selectinload
    from submission_results.models import SubmissionResult
    return (
        db.query(Submission)
        .options(
            selectinload(Submission.results).selectinload(SubmissionResult.test_case)
        )
        .filter(Submission.id == submission_id)
        .first()
    )

def get_submissions_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(Submission).filter(
        Submission.user_id == user_id
    ).order_by(Submission.created_at.desc()).offset(skip).limit(limit).all()

def get_submissions_by_problem(db: Session, problem_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(Submission).filter(
        Submission.problem_id == problem_id
    ).order_by(Submission.created_at.desc()).offset(skip).limit(limit).all()

def get_submissions_by_contest(db: Session, contest_id: uuid.UUID, skip: int = 0, limit: int = 50):
    return db.query(Submission).filter(
        Submission.contest_id == contest_id
    ).order_by(Submission.created_at.desc()).offset(skip).limit(limit).all()

def update_submission_status(db: Session, submission_id: uuid.UUID, status: SubmissionStatus,
                              time_ms: int = None, memory_mb: float = None,
                              score: float = None, error_message: str = None):
    db_sub = get_submission_by_id(db, submission_id)
    if not db_sub:
        return None
    db_sub.status = status
    if time_ms is not None:
        db_sub.time_ms = time_ms
    if memory_mb is not None:
        db_sub.memory_mb = memory_mb
    if score is not None:
        db_sub.score = score
    if error_message is not None:
        db_sub.error_message = error_message
    db.commit()
    db.refresh(db_sub)
    return db_sub