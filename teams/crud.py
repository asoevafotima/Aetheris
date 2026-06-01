from sqlalchemy.orm import Session
from .models import Team
from .schemas import TeamCreate, TeamUpdate
from slugify import slugify
import uuid

def get_team_by_id(db: Session, team_id: uuid.UUID):
    return db.query(Team).filter(Team.id == team_id).first()

def get_team_by_slug(db: Session, slug: str):
    return db.query(Team).filter(Team.slug == slug).first()

def get_all_teams(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Team).filter(Team.is_public == True).offset(skip).limit(limit).all()

def create_team(db: Session, data: TeamCreate, owner_id: uuid.UUID):
    slug = slugify(data.name)
    db_team = Team(**data.model_dump(), slug=slug, owner_id=owner_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def update_team(db: Session, team_id: uuid.UUID, data: TeamUpdate):
    db_team = get_team_by_id(db, team_id)
    if not db_team:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_team, field, value)
    db.commit()
    db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: uuid.UUID):
    db_team = get_team_by_id(db, team_id)
    if db_team:
        db.delete(db_team)
        db.commit()
    return db_team