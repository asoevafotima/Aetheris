from sqlalchemy.orm import Session
from uuid import UUID
from .models import TeamInvitation, TeamInvitationStatus

def create_invitation(db: Session, team_id: UUID, from_user_id: UUID, to_user_id: UUID):
    inv = TeamInvitation(team_id=team_id, from_user_id=from_user_id, to_user_id=to_user_id)
    db.add(inv); db.commit(); db.refresh(inv)
    return inv

def get_invitation_by_id(db: Session, inv_id: UUID):
    return db.query(TeamInvitation).filter(TeamInvitation.id == inv_id).first()

def get_pending_for_user(db: Session, user_id: UUID):
    return db.query(TeamInvitation).filter(
        TeamInvitation.to_user_id == user_id,
        TeamInvitation.status == TeamInvitationStatus.pending
    ).all()

def get_sent_by_user(db: Session, user_id: UUID):
    return db.query(TeamInvitation).filter(
        TeamInvitation.from_user_id == user_id
    ).all()

def update_status(db: Session, inv_id: UUID, status: TeamInvitationStatus):
    inv = get_invitation_by_id(db, inv_id)
    if inv:
        inv.status = status
        db.commit(); db.refresh(inv)
    return inv
