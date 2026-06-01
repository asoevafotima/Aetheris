from sqlalchemy.orm import Session
from .models import Achievement
from .schemas import AchievementCreate
import uuid

def get_all_achievements(db: Session):
    return db.query(Achievement).all()

def get_achievement_by_id(db: Session, achievement_id: uuid.UUID):
    return db.query(Achievement).filter(Achievement.id == achievement_id).first()

def get_achievement_by_key(db: Session, condition_key: str, condition_value: str):
    return db.query(Achievement).filter(
        Achievement.condition_key == condition_key,
        Achievement.condition_value == condition_value
    ).first()

def create_achievement(db: Session, data: AchievementCreate):
    db_ach = Achievement(**data.model_dump())
    db.add(db_ach)
    db.commit()
    db.refresh(db_ach)
    return db_ach

def delete_achievement(db: Session, achievement_id: uuid.UUID):
    db_ach = get_achievement_by_id(db, achievement_id)
    if db_ach:
        db.delete(db_ach)
        db.commit()
    return db_ach