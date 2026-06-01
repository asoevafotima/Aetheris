from sqlalchemy.orm import Session
from datetime import datetime
from .models import RefreshToken
import uuid

def create_refresh_token(db: Session, user_id: uuid.UUID, token: str, expires_at: datetime):
    db_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def get_refresh_token(db: Session, token: str):
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def revoke_refresh_token(db: Session, token: str):
    db_token = get_refresh_token(db, token)
    if db_token:
        db_token.is_revoked = True
        db.commit()
    return db_token

def revoke_all_user_tokens(db: Session, user_id: uuid.UUID):
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id
    ).update({"is_revoked": True})
    db.commit()

def delete_expired_tokens(db: Session):
    db.query(RefreshToken).filter(
        RefreshToken.expires_at < datetime.utcnow()
    ).delete()
    db.commit()
    