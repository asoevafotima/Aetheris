from sqlalchemy.orm import Session
from .models import DuelInvitation, InvitationStatus
from .schemas import DuelInvitationCreate
import uuid
from datetime import datetime, timedelta

def create_invitation(db: Session, data: DuelInvitationCreate, from_user_id: uuid.UUID):
    expires_at = datetime.utcnow() + timedelta(hours=24)
    db_inv = DuelInvitation(
        **data.model_dump(),
        from_user_id=from_user_id,
        expires_at=expires_at
    )
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)
    return db_inv

def get_invitation_by_id(db: Session, inv_id: uuid.UUID):
    return db.query(DuelInvitation).filter(DuelInvitation.id == inv_id).first()

def get_invitations_by_user(db: Session, user_id: uuid.UUID):
    return db.query(DuelInvitation).filter(
        DuelInvitation.to_user_id == user_id,
        DuelInvitation.status == InvitationStatus.pending
    ).all()

def update_invitation_status(db: Session, inv_id: uuid.UUID, status: InvitationStatus):
    db_inv = get_invitation_by_id(db, inv_id)
    if db_inv:
        db_inv.status = status
        db.commit()
        db.refresh(db_inv)
    return db_inv
