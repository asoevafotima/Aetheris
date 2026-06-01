from sqlalchemy.orm import Session
from .models import Notification, NotificationType
import uuid

def create_notification(db: Session, user_id: uuid.UUID, type: NotificationType,
                         title: str, body: str, payload: str = None):
    db_notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        payload=payload
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_notifications_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def mark_as_read(db: Session, notification_id: uuid.UUID):
    db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notif:
        db_notif.is_read = True
        db.commit()
    return db_notif

def mark_all_as_read(db: Session, user_id: uuid.UUID):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

def get_unread_count(db: Session, user_id: uuid.UUID):
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

def delete_notification(db: Session, notification_id: uuid.UUID):
    db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notif:
        db.delete(db_notif)
        db.commit()
    return db_notif