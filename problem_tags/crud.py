from sqlalchemy.orm import Session
from .models import ProblemTag
from .schemas import ProblemTagCreate, ProblemTagUpdate
import uuid

def get_all_tags(db: Session):
    return db.query(ProblemTag).all()

def get_tag_by_id(db: Session, tag_id: uuid.UUID):
    return db.query(ProblemTag).filter(ProblemTag.id == tag_id).first()

def get_tag_by_slug(db: Session, slug: str):
    return db.query(ProblemTag).filter(ProblemTag.slug == slug).first()

def create_tag(db: Session, data: ProblemTagCreate):
    db_tag = ProblemTag(**data.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def update_tag(db: Session, tag_id: uuid.UUID, data: ProblemTagUpdate):
    db_tag = get_tag_by_id(db, tag_id)
    if not db_tag:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_tag, field, value)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def delete_tag(db: Session, tag_id: uuid.UUID):
    db_tag = get_tag_by_id(db, tag_id)
    if db_tag:
        db.delete(db_tag)
        db.commit()
    return db_tag