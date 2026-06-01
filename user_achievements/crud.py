from sqlalchemy.orm import Session
from .models import UserAchievement
import uuid

def award_achievement(db: Session, user_id: uuid.UUID, achievement_id: uuid.UUID):
    existing = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.achievement_id == achievement_id
    ).first()
    if existing:
        return existing
    db_ua = UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(db_ua)
    db.commit()
    db.refresh(db_ua)
    return db_ua

def get_achievements_by_user(db: Session, user_id: uuid.UUID):
    return db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id
    ).all()

def has_achievement(db: Session, user_id: uuid.UUID, achievement_id: uuid.UUID):
    return db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.achievement_id == achievement_id
    ).first() is not None