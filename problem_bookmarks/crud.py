from sqlalchemy.orm import Session
from .models import ProblemBookmark
import uuid

def add_bookmark(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    existing = db.query(ProblemBookmark).filter(
        ProblemBookmark.user_id == user_id,
        ProblemBookmark.problem_id == problem_id
    ).first()
    if existing:
        return existing
    db_bm = ProblemBookmark(user_id=user_id, problem_id=problem_id)
    db.add(db_bm)
    db.commit()
    db.refresh(db_bm)
    return db_bm

def get_bookmarks_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(ProblemBookmark).filter(
        ProblemBookmark.user_id == user_id
    ).order_by(ProblemBookmark.created_at.desc()).offset(skip).limit(limit).all()

def remove_bookmark(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    db_bm = db.query(ProblemBookmark).filter(
        ProblemBookmark.user_id == user_id,
        ProblemBookmark.problem_id == problem_id
    ).first()
    if db_bm:
        db.delete(db_bm)
        db.commit()
    return db_bm

def is_bookmarked(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    return db.query(ProblemBookmark).filter(
        ProblemBookmark.user_id == user_id,
        ProblemBookmark.problem_id == problem_id
    ).first() is not None