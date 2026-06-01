from sqlalchemy.orm import Session
from .models import DuelRating
import uuid

def create_duel_rating(db: Session, duel_id: uuid.UUID, user_id: uuid.UUID,
                        old_rating: int, new_rating: int):
    delta = new_rating - old_rating
    db_rating = DuelRating(
        duel_id=duel_id,
        user_id=user_id,
        old_rating=old_rating,
        new_rating=new_rating,
        delta=delta
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def get_ratings_by_duel(db: Session, duel_id: uuid.UUID):
    return db.query(DuelRating).filter(DuelRating.duel_id == duel_id).all()

def get_ratings_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(DuelRating).filter(
        DuelRating.user_id == user_id
    ).order_by(DuelRating.created_at.desc()).offset(skip).limit(limit).all()
