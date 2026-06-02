from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/problems", tags=["problems"])

@router.get("/", response_model=list[schemas.ProblemShortResponse])
def list_problems(
    skip: int = 0,
    limit: int = 20,
    difficulty: str = Query(None),
    difficulty_code: str = Query(None),
    topic: str = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_all_problems(db, skip, limit, difficulty, difficulty_code, topic)

@router.get("/{slug}", response_model=schemas.ProblemResponse)
def get_problem(slug: str, db: Session = Depends(get_db)):
    problem = crud.get_problem_by_slug(db, slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.post("/", response_model=schemas.ProblemResponse, status_code=201)
def create_problem(data: schemas.ProblemCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.create_problem(db, data, current_user.id)

@router.patch("/{problem_id}", response_model=schemas.ProblemResponse)
def update_problem(problem_id, data: schemas.ProblemUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    problem = crud.get_problem_by_id(db, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if str(problem.author_id) != str(current_user.id) and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return crud.update_problem(db, problem_id, data)

@router.delete("/{problem_id}", status_code=204)
def delete_problem(problem_id, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin"]))):
    crud.delete_problem(db, problem_id)