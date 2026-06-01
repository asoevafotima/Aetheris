from sqlalchemy.orm import Session
from .models import ContestStanding
import uuid

def get_standings_by_contest(db: Session, contest_id: uuid.UUID):
    return db.query(ContestStanding).filter(
        ContestStanding.contest_id == contest_id
    ).order_by(ContestStanding.rank).all()

def get_standing_by_user(db: Session, contest_id: uuid.UUID, user_id: uuid.UUID):
    return db.query(ContestStanding).filter(
        ContestStanding.contest_id == contest_id,
        ContestStanding.user_id == user_id
    ).first()

def upsert_standing(db: Session, contest_id: uuid.UUID, user_id: uuid.UUID,
                    score: int, penalty: int):
    db_standing = get_standing_by_user(db, contest_id, user_id)
    if db_standing:
        db_standing.score = score
        db_standing.penalty = penalty
    else:
        db_standing = ContestStanding(
            contest_id=contest_id,
            user_id=user_id,
            score=score,
            penalty=penalty
        )
        db.add(db_standing)
    db.commit()
    db.refresh(db_standing)
    return db_standing

def update_ranks(db: Session, contest_id: uuid.UUID):
    standings = db.query(ContestStanding).filter(
        ContestStanding.contest_id == contest_id
    ).order_by(ContestStanding.score.desc(), ContestStanding.penalty).all()
    for i, standing in enumerate(standings):
        standing.rank = i + 1
    db.commit()
    