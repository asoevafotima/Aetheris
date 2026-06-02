from sqlalchemy.orm import Session
from .models import ContestProblem
from .schemas import ContestProblemCreate, ContestProblemUpdate
import uuid


def _to_uuid(val) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def get_problems_by_contest(db: Session, contest_id):
    return db.query(ContestProblem).filter(
        ContestProblem.contest_id == _to_uuid(contest_id)
    ).order_by(ContestProblem.order_num).all()


def get_contest_problem_by_id(db: Session, cp_id):
    return db.query(ContestProblem).filter(ContestProblem.id == _to_uuid(cp_id)).first()


def add_problem_to_contest(db: Session, data: ContestProblemCreate):
    db_cp = ContestProblem(**data.model_dump())
    db.add(db_cp)
    db.commit()
    db.refresh(db_cp)
    return db_cp


def update_contest_problem(db: Session, cp_id, data: ContestProblemUpdate):
    db_cp = get_contest_problem_by_id(db, cp_id)
    if not db_cp:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_cp, field, value)
    db.commit()
    db.refresh(db_cp)
    return db_cp


def remove_problem_from_contest(db: Session, cp_id):
    db_cp = get_contest_problem_by_id(db, cp_id)
    if db_cp:
        db.delete(db_cp)
        db.commit()
    return db_cp
