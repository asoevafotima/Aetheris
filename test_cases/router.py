from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/test-cases", tags=["test-cases"])

@router.get("/problem/{problem_id}", response_model=list[schemas.TestCaseSampleResponse])
def get_sample_cases(problem_id, db: Session = Depends(get_db)):
    return crud.get_sample_test_cases(db, problem_id)

@router.get("/problem/{problem_id}/all", response_model=list[schemas.TestCaseResponse])
def get_all_cases(problem_id, db: Session = Depends(get_db),
                  current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.get_test_cases_by_problem(db, problem_id)

@router.post("/", response_model=schemas.TestCaseResponse, status_code=201)
def create_case(data: schemas.TestCaseCreate, db: Session = Depends(get_db),
                current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.create_test_case(db, data)

@router.patch("/{test_case_id}", response_model=schemas.TestCaseResponse)
def update_case(test_case_id, data: schemas.TestCaseUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(require_role(["admin", "moderator"]))):
    tc = crud.update_test_case(db, test_case_id, data)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    return tc

@router.delete("/{test_case_id}", status_code=204)
def delete_case(test_case_id, db: Session = Depends(get_db),
                current_user: User = Depends(require_role(["admin"]))):
    crud.delete_test_case(db, test_case_id)