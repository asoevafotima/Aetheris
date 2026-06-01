from sqlalchemy.orm import Session
from .models import ProblemTagMap
import uuid

def add_tag_to_problem(db: Session, problem_id: uuid.UUID, tag_id: uuid.UUID):
    existing = db.query(ProblemTagMap).filter(
        ProblemTagMap.problem_id == problem_id,
        ProblemTagMap.tag_id == tag_id
    ).first()
    if existing:
        return existing
    db_map = ProblemTagMap(problem_id=problem_id, tag_id=tag_id)
    db.add(db_map)
    db.commit()
    db.refresh(db_map)
    return db_map

def remove_tag_from_problem(db: Session, problem_id: uuid.UUID, tag_id: uuid.UUID):
    db_map = db.query(ProblemTagMap).filter(
        ProblemTagMap.problem_id == problem_id,
        ProblemTagMap.tag_id == tag_id
    ).first()
    if db_map:
        db.delete(db_map)
        db.commit()
    return db_map

def get_tags_by_problem(db: Session, problem_id: uuid.UUID):
    return db.query(ProblemTagMap).filter(
        ProblemTagMap.problem_id == problem_id
    ).all()

def get_problems_by_tag(db: Session, tag_id: uuid.UUID):
    return db.query(ProblemTagMap).filter(
        ProblemTagMap.tag_id == tag_id
    ).all()