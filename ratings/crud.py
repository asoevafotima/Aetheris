from sqlalchemy.orm import Session
from .models import Rating
import uuid

def create_rating_record(db: Session, user_id: uuid.UUID, old_rating: int,
                          new_rating: int, reason: str, contest_id: uuid.UUID = None):
    delta = new_rating - old_rating
    db_rating = Rating(
        user_id=user_id,
        contest_id=contest_id,
        old_rating=old_rating,
        new_rating=new_rating,
        delta=delta,
        reason=reason
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def get_rating_history_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(Rating).filter(
        Rating.user_id == user_id
    ).order_by(Rating.created_at.desc()).offset(skip).limit(limit).all()

def get_ratings_by_contest(db: Session, contest_id: uuid.UUID):
    return db.query(Rating).filter(Rating.contest_id == contest_id).all()