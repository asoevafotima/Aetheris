from sqlalchemy.orm import Session
from .models import SubmissionResult, ResultStatus
import uuid

def create_result(db: Session, submission_id: uuid.UUID, test_case_id: uuid.UUID,
                  status: ResultStatus, time_ms: int = None,
                  memory_mb: float = None, actual_output: str = None):
    db_result = SubmissionResult(
        submission_id=submission_id,
        test_case_id=test_case_id,
        status=status,
        time_ms=time_ms,
        memory_mb=memory_mb,
        actual_output=actual_output
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_results_by_submission(db: Session, submission_id: uuid.UUID):
    return db.query(SubmissionResult).filter(
        SubmissionResult.submission_id == submission_id
    ).all()

def get_result_by_id(db: Session, result_id: uuid.UUID):
    return db.query(SubmissionResult).filter(
        SubmissionResult.id == result_id
    ).first()

def delete_results_by_submission(db: Session, submission_id: uuid.UUID):
    db.query(SubmissionResult).filter(
        SubmissionResult.submission_id == submission_id
    ).delete()
    db.commit()
    