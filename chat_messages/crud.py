from sqlalchemy.orm import Session
from .models import ChatMessage
import uuid


def _to_uuid(val) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def create_message(db: Session, user_id, content: str,
                   contest_id=None, duel_id=None, team_id=None):
    db_msg = ChatMessage(
        user_id=_to_uuid(user_id),
        content=content,
        contest_id=_to_uuid(contest_id) if contest_id else None,
        duel_id=_to_uuid(duel_id) if duel_id else None,
        team_id=_to_uuid(team_id) if team_id else None,
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


def get_messages_by_contest(db: Session, contest_id, skip: int = 0, limit: int = 50):
    return db.query(ChatMessage).filter(
        ChatMessage.contest_id == _to_uuid(contest_id),
        ChatMessage.is_deleted == False
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()


def get_messages_by_duel(db: Session, duel_id, skip: int = 0, limit: int = 50):
    return db.query(ChatMessage).filter(
        ChatMessage.duel_id == _to_uuid(duel_id),
        ChatMessage.is_deleted == False
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()


def get_messages_by_team(db: Session, team_id, skip: int = 0, limit: int = 100):
    return db.query(ChatMessage).filter(
        ChatMessage.team_id == _to_uuid(team_id),
        ChatMessage.is_deleted == False
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()


def delete_message(db: Session, message_id):
    db_msg = db.query(ChatMessage).filter(ChatMessage.id == _to_uuid(message_id)).first()
    if db_msg:
        db_msg.is_deleted = True
        db.commit()
    return db_msg
