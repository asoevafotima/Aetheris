from sqlalchemy.orm import Session
from .models import ContestParticipant
import uuid

def register_participant(db: Session, contest_id: uuid.UUID, user_id: uuid.UUID):
    existing = db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == contest_id,
        ContestParticipant.user_id == user_id
    ).first()
    if existing:
        return existing
    db_participant = ContestParticipant(contest_id=contest_id, user_id=user_id)
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

def get_participants_by_contest(db: Session, contest_id: uuid.UUID):
    return db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == contest_id
    ).all()

def get_participant(db: Session, contest_id: uuid.UUID, user_id: uuid.UUID):
    return db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == contest_id,
        ContestParticipant.user_id == user_id
    ).first()

def unregister_participant(db: Session, contest_id: uuid.UUID, user_id: uuid.UUID):
    db_participant = get_participant(db, contest_id, user_id)
    if db_participant:
        db.delete(db_participant)
        db.commit()
    return db_participant