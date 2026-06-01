from sqlalchemy.orm import Session
from .models import UserProfile
from .schemas import UserProfileUpdate
import uuid

def get_profile_by_user_id(db: Session, user_id: uuid.UUID):
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def create_profile(db: Session, user_id: uuid.UUID):
    db_profile = UserProfile(user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, user_id: uuid.UUID, data: UserProfileUpdate):
    db_profile = get_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_profile, field, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_profile(db: Session, user_id: uuid.UUID):
    db_profile = get_profile_by_user_id(db, user_id)
    if db_profile:
        db.delete(db_profile)
        db.commit()
    return db_profile