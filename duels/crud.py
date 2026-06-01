from sqlalchemy.orm import Session
from .models import Duel, DuelStatus, DuelResult
from .schemas import DuelCreate
import uuid
from datetime import datetime

def create_duel(db: Session, data: DuelCreate, challenger_id: uuid.UUID):
    db_duel = Duel(**data.model_dump(), challenger_id=challenger_id)
    db.add(db_duel)
    db.commit()
    db.refresh(db_duel)
    return db_duel

def get_duel_by_id(db: Session, duel_id: uuid.UUID):
    return db.query(Duel).filter(Duel.id == duel_id).first()

def get_active_duels(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Duel).filter(
        Duel.status == DuelStatus.active
    ).offset(skip).limit(limit).all()

def get_duels_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(Duel).filter(
        (Duel.challenger_id == user_id) | (Duel.opponent_id == user_id)
    ).order_by(Duel.created_at.desc()).offset(skip).limit(limit).all()

def accept_duel(db: Session, duel_id: uuid.UUID, opponent_id: uuid.UUID):
    db_duel = get_duel_by_id(db, duel_id)
    if db_duel:
        db_duel.opponent_id = opponent_id
        db_duel.status = DuelStatus.active
        db_duel.started_at = datetime.utcnow()
        db.commit()
        db.refresh(db_duel)
    return db_duel

def finish_duel(db: Session, duel_id: uuid.UUID, result: DuelResult):
    db_duel = get_duel_by_id(db, duel_id)
    if db_duel:
        db_duel.status = DuelStatus.finished
        db_duel.result = result
        db_duel.finished_at = datetime.utcnow()
        db.commit()
        db.refresh(db_duel)
    return db_duel

def cancel_duel(db: Session, duel_id: uuid.UUID):
    db_duel = get_duel_by_id(db, duel_id)
    if db_duel:
        db_duel.status = DuelStatus.cancelled
        db.commit()
    return db_duel
