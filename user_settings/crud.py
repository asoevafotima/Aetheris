from sqlalchemy.orm import Session
from .models import UserSettings
from .schemas import UserSettingsUpdate
import uuid

def get_settings_by_user_id(db: Session, user_id: uuid.UUID):
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

def create_settings(db: Session, user_id: uuid.UUID):
    db_settings = UserSettings(user_id=user_id)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_settings(db: Session, user_id: uuid.UUID, data: UserSettingsUpdate):
    db_settings = get_settings_by_user_id(db, user_id)
    if not db_settings:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_settings, field, value)
    db.commit()
    db.refresh(db_settings)
    return db_settings