from sqlalchemy.orm import Session
from .models import AIAnalysis
import uuid

def create_analysis(db: Session, user_id: uuid.UUID, submission_id: uuid.UUID,
                    analysis_type: str, result: str, tokens_used: int):
    db_analysis = AIAnalysis(
        user_id=user_id,
        submission_id=submission_id,
        analysis_type=analysis_type,
        result=result,
        tokens_used=tokens_used
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis

def get_analysis_by_submission(db: Session, submission_id: uuid.UUID):
    return db.query(AIAnalysis).filter(
        AIAnalysis.submission_id == submission_id
    ).all()

def get_analysis_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(AIAnalysis).filter(
        AIAnalysis.user_id == user_id
    ).order_by(AIAnalysis.created_at.desc()).offset(skip).limit(limit).all()