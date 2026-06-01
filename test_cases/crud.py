from sqlalchemy.orm import Session
from .models import TestCase
from .schemas import TestCaseCreate, TestCaseUpdate
import uuid

def get_test_cases_by_problem(db: Session, problem_id: uuid.UUID):
    return db.query(TestCase).filter(
        TestCase.problem_id == problem_id
    ).order_by(TestCase.order_num).all()

def get_sample_test_cases(db: Session, problem_id: uuid.UUID):
    return db.query(TestCase).filter(
        TestCase.problem_id == problem_id,
        TestCase.is_sample == True
    ).all()

def get_test_case_by_id(db: Session, test_case_id: uuid.UUID):
    return db.query(TestCase).filter(TestCase.id == test_case_id).first()

def create_test_case(db: Session, data: TestCaseCreate):
    db_tc = TestCase(**data.model_dump())
    db.add(db_tc)
    db.commit()
    db.refresh(db_tc)
    return db_tc

def update_test_case(db: Session, test_case_id: uuid.UUID, data: TestCaseUpdate):
    db_tc = get_test_case_by_id(db, test_case_id)
    if not db_tc:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_tc, field, value)
    db.commit()
    db.refresh(db_tc)
    return db_tc

def delete_test_case(db: Session, test_case_id: uuid.UUID):
    db_tc = get_test_case_by_id(db, test_case_id)
    if db_tc:
        db.delete(db_tc)
        db.commit()
    return db_tc