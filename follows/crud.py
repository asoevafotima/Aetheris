from sqlalchemy.orm import Session
from .models import Follow
import uuid

def follow_user(db: Session, follower_id: uuid.UUID, following_id: uuid.UUID):
    existing = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first()
    if existing:
        return existing
    db_follow = Follow(follower_id=follower_id, following_id=following_id)
    db.add(db_follow)
    db.commit()
    db.refresh(db_follow)
    return db_follow

def unfollow_user(db: Session, follower_id: uuid.UUID, following_id: uuid.UUID):
    db_follow = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first()
    if db_follow:
        db.delete(db_follow)
        db.commit()
    return db_follow

def get_following(db: Session, user_id: uuid.UUID):
    from sqlalchemy.orm import selectinload
    return db.query(Follow).options(
        selectinload(Follow.following)
    ).filter(Follow.follower_id == user_id).all()

def get_followers(db: Session, user_id: uuid.UUID):
    return db.query(Follow).filter(Follow.following_id == user_id).all()

def is_following(db: Session, follower_id: uuid.UUID, following_id: uuid.UUID):
    return db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first() is not None