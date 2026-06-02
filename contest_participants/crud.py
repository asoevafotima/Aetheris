from sqlalchemy.orm import Session
from .models import ContestParticipant
import uuid


def _to_uuid(val) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def register_participant(db: Session, user_id, contest_id):
    uid = _to_uuid(user_id)
    cid = _to_uuid(contest_id)
    existing = db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == cid,
        ContestParticipant.user_id == uid
    ).first()
    if existing:
        return existing
    db_participant = ContestParticipant(contest_id=cid, user_id=uid)
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


def get_participants_by_contest(db: Session, contest_id):
    return db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == _to_uuid(contest_id)
    ).all()


def get_participant(db: Session, contest_id, user_id):
    return db.query(ContestParticipant).filter(
        ContestParticipant.contest_id == _to_uuid(contest_id),
        ContestParticipant.user_id == _to_uuid(user_id)
    ).first()


def unregister_participant(db: Session, contest_id, user_id):
    db_participant = get_participant(db, contest_id, user_id)
    if db_participant:
        db.delete(db_participant)
        db.commit()
    return db_participant
