from sqlalchemy.orm import Session
from .models import ChatMessage
import uuid

def create_message(db: Session, user_id: uuid.UUID, content: str,
                   contest_id: uuid.UUID = None, duel_id: uuid.UUID = None):
    db_msg = ChatMessage(
        user_id=user_id,
        content=content,
        contest_id=contest_id,
        duel_id=duel_id
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_messages_by_contest(db: Session, contest_id: uuid.UUID, skip: int = 0, limit: int = 50):
    return db.query(ChatMessage).filter(
        ChatMessage.contest_id == contest_id,
        ChatMessage.is_deleted == False
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()

def get_messages_by_duel(db: Session, duel_id: uuid.UUID, skip: int = 0, limit: int = 50):
    return db.query(ChatMessage).filter(
        ChatMessage.duel_id == duel_id,
        ChatMessage.is_deleted == False
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()

def delete_message(db: Session, message_id: uuid.UUID):
    db_msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if db_msg:
        db_msg.is_deleted = True
        db.commit()
    return db_msg