from sqlalchemy.orm import Session
from .models import TeamMember, TeamRole
import uuid

def add_member(db: Session, team_id: uuid.UUID, user_id: uuid.UUID, role: TeamRole = TeamRole.member):
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    if existing:
        return existing
    db_member = TeamMember(team_id=team_id, user_id=user_id, role=role)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def get_members_by_team(db: Session, team_id: uuid.UUID):
    return db.query(TeamMember).filter(TeamMember.team_id == team_id).all()

def get_member(db: Session, team_id: uuid.UUID, user_id: uuid.UUID):
    return db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()

def update_member_role(db: Session, team_id: uuid.UUID, user_id: uuid.UUID, role: TeamRole):
    db_member = get_member(db, team_id, user_id)
    if db_member:
        db_member.role = role
        db.commit()
        db.refresh(db_member)
    return db_member

def remove_member(db: Session, team_id: uuid.UUID, user_id: uuid.UUID):
    db_member = get_member(db, team_id, user_id)
    if db_member:
        db.delete(db_member)
        db.commit()
    return db_member