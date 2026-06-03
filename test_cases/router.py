from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/test-cases", tags=["test-cases"])

@router.get("/problem/{problem_id}", response_model=list[schemas.TestCaseSampleResponse])
def get_sample_cases(problem_id: UUID, db: Session = Depends(get_db)):
    return crud.get_sample_test_cases(db, problem_id)

def _check_problem_owner(db: Session, problem_id: UUID, user) -> None:
    from problems.crud import get_problem_by_id
    problem = get_problem_by_id(db, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if str(problem.author_id) != str(user.id) and user.role not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/problem/{problem_id}/all", response_model=list[schemas.TestCaseResponse])
def get_all_cases(problem_id: UUID, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    _check_problem_owner(db, problem_id, current_user)
    return crud.get_test_cases_by_problem(db, problem_id)

@router.post("/", response_model=schemas.TestCaseResponse, status_code=201)
def create_case(data: schemas.TestCaseCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    _check_problem_owner(db, data.problem_id, current_user)
    return crud.create_test_case(db, data)

@router.patch("/{test_case_id}", response_model=schemas.TestCaseResponse)
def update_case(test_case_id: UUID, data: schemas.TestCaseUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    tc = crud.get_test_case_by_id(db, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    _check_problem_owner(db, tc.problem_id, current_user)
    updated = crud.update_test_case(db, test_case_id, data)
    return updated

@router.delete("/{test_case_id}", status_code=204)
def delete_case(test_case_id: UUID, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    tc = crud.get_test_case_by_id(db, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    _check_problem_owner(db, tc.problem_id, current_user)
    crud.delete_test_case(db, test_case_id)