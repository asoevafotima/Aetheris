from sqlalchemy.orm import Session
from .models import Problem
from .schemas import ProblemCreate, ProblemUpdate
from slugify import slugify
import uuid

def get_problem_by_id(db: Session, problem_id: uuid.UUID):
    return db.query(Problem).filter(Problem.id == problem_id).first()

def get_problem_by_slug(db: Session, slug: str):
    return db.query(Problem).filter(Problem.slug == slug).first()

def get_all_problems(db: Session, skip: int = 0, limit: int = 20, difficulty: str = None):
    query = db.query(Problem).filter(Problem.is_public == True)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    return query.offset(skip).limit(limit).all()

def create_problem(db: Session, data: ProblemCreate, author_id: uuid.UUID):
    slug = slugify(data.title)
    db_problem = Problem(
        **data.model_dump(),
        slug=slug,
        author_id=author_id
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def update_problem(db: Session, problem_id: uuid.UUID, data: ProblemUpdate):
    db_problem = get_problem_by_id(db, problem_id)
    if not db_problem:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_problem, field, value)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def delete_problem(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db.delete(db_problem)
        db.commit()
    return db_problem

def increment_solve_count(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db_problem.solve_count += 1
        db.commit()

def increment_attempt_count(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db_problem.attempt_count += 1
        db.commit()