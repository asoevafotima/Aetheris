from sqlalchemy.orm import Session
from .models import AuditLog
import uuid

def create_log(db: Session, user_id: uuid.UUID, action: str,
               target_type: str, target_id: uuid.UUID = None,
               details: str = None, ip_address: str = None):
    db_log = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        ip_address=ip_address
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_logs_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 50):
    return db.query(AuditLog).filter(
        AuditLog.user_id == user_id
    ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

def get_all_logs(db: Session, skip: int = 0, limit: int = 50):
    return db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).offset(skip).limit(limit).all()

def get_logs_by_target(db: Session, target_type: str, target_id: uuid.UUID):
    return db.query(AuditLog).filter(
        AuditLog.target_type == target_type,
        AuditLog.target_id == target_id
    ).order_by(AuditLog.created_at.desc()).all()