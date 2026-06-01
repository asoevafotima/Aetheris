from sqlalchemy.orm import Session
from .models import User
from .schemas import UserCreate, UserUpdate
import bcrypt
import uuid


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_user_by_id(db: Session, user_id: uuid.UUID):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 20):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, data: UserCreate):
    db_user = User(
        username=data.username,
        email=data.email,
        hashed_password=_hash_password(data.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: uuid.UUID, data: UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: uuid.UUID):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def activate_user(db: Session, user_id: uuid.UUID):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.is_verified = True
        db.commit()
    return db_user
