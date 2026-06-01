from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role
from users.models import User

router = APIRouter(prefix="/contest-problems", tags=["contest-problems"])

@router.get("/{contest_id}", response_model=list[schemas.ContestProblemResponse])
def get_problems(contest_id, db: Session = Depends(get_db)):
    return crud.get_problems_by_contest(db, contest_id)

@router.post("/", response_model=schemas.ContestProblemResponse, status_code=201)
def add_problem(data: schemas.ContestProblemCreate, db: Session = Depends(get_db),
                current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.add_problem_to_contest(db, data)

@router.patch("/{cp_id}", response_model=schemas.ContestProblemResponse)
def update_problem(cp_id, data: schemas.ContestProblemUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    cp = crud.update_contest_problem(db, cp_id, data)
    if not cp:
        raise HTTPException(status_code=404, detail="Not found")
    return cp

@router.delete("/{cp_id}", status_code=204)
def remove_problem(cp_id, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    crud.remove_problem_from_contest(db, cp_id)