from sqlalchemy.orm import Session
from .models import Editorial
from .schemas import EditorialCreate, EditorialUpdate
import uuid

def get_editorial_by_problem(db: Session, problem_id: uuid.UUID):
    return db.query(Editorial).filter(
        Editorial.problem_id == problem_id
    ).first()

def get_editorial_by_id(db: Session, editorial_id: uuid.UUID):
    return db.query(Editorial).filter(Editorial.id == editorial_id).first()

def create_editorial(db: Session, data: EditorialCreate, author_id: uuid.UUID):
    db_editorial = Editorial(**data.model_dump(), author_id=author_id)
    db.add(db_editorial)
    db.commit()
    db.refresh(db_editorial)
    return db_editorial

def update_editorial(db: Session, editorial_id: uuid.UUID, data: EditorialUpdate):
    db_editorial = get_editorial_by_id(db, editorial_id)
    if not db_editorial:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_editorial, field, value)
    db.commit()
    db.refresh(db_editorial)
    return db_editorial

def delete_editorial(db: Session, editorial_id: uuid.UUID):
    db_editorial = get_editorial_by_id(db, editorial_id)
    if db_editorial:
        db.delete(db_editorial)
        db.commit()
    return db_editorial