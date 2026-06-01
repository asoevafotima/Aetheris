from sqlalchemy.orm import Session
from .models import UserWeakTopic
from datetime import datetime
import uuid

def upsert_weak_topic(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    existing = db.query(UserWeakTopic).filter(
        UserWeakTopic.user_id == user_id,
        UserWeakTopic.problem_id == problem_id
    ).first()
    if existing:
        existing.fail_count += 1
        existing.last_failed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    db_wt = UserWeakTopic(user_id=user_id, problem_id=problem_id)
    db.add(db_wt)
    db.commit()
    db.refresh(db_wt)
    return db_wt

def get_weak_topics_by_user(db: Session, user_id: uuid.UUID):
    return db.query(UserWeakTopic).filter(
        UserWeakTopic.user_id == user_id
    ).order_by(UserWeakTopic.fail_count.desc()).all()

def delete_weak_topic(db: Session, user_id: uuid.UUID, problem_id: uuid.UUID):
    db_wt = db.query(UserWeakTopic).filter(
        UserWeakTopic.user_id == user_id,
        UserWeakTopic.problem_id == problem_id
    ).first()
    if db_wt:
        db.delete(db_wt)
        db.commit()
    return db_wt