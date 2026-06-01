from sqlalchemy.orm import Session
from .models import Contest, ContestStatus
from .schemas import ContestCreate, ContestUpdate
from slugify import slugify
import uuid

def get_contest_by_id(db: Session, contest_id: uuid.UUID):
    return db.query(Contest).filter(Contest.id == contest_id).first()

def get_contest_by_slug(db: Session, slug: str):
    return db.query(Contest).filter(Contest.slug == slug).first()

def get_all_contests(db: Session, skip: int = 0, limit: int = 20, status: str = None):
    query = db.query(Contest).filter(Contest.is_public == True)
    if status:
        query = query.filter(Contest.status == status)
    return query.order_by(Contest.starts_at.desc()).offset(skip).limit(limit).all()

def create_contest(db: Session, data: ContestCreate, author_id: uuid.UUID):
    slug = slugify(data.title)
    db_contest = Contest(**data.model_dump(), slug=slug, author_id=author_id)
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest

def update_contest(db: Session, contest_id: uuid.UUID, data: ContestUpdate):
    db_contest = get_contest_by_id(db, contest_id)
    if not db_contest:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_contest, field, value)
    db.commit()
    db.refresh(db_contest)
    return db_contest

def delete_contest(db: Session, contest_id: uuid.UUID):
    db_contest = get_contest_by_id(db, contest_id)
    if db_contest:
        db.delete(db_contest)
        db.commit()
    return db_contest

def update_contest_status(db: Session, contest_id: uuid.UUID, status: ContestStatus):
    db_contest = get_contest_by_id(db, contest_id)
    if db_contest:
        db_contest.status = status
        db.commit()
    return db_contest