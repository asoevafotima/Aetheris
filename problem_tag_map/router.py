from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role
from users.models import User

router = APIRouter(prefix="/problem-tag-map", tags=["problem-tag-map"])

@router.post("/", response_model=schemas.ProblemTagMapResponse, status_code=201)
def add_tag(data: schemas.ProblemTagMapCreate, db: Session = Depends(get_db),
            current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.add_tag_to_problem(db, data.problem_id, data.tag_id)

@router.delete("/", status_code=204)
def remove_tag(data: schemas.ProblemTagMapCreate, db: Session = Depends(get_db),
               current_user: User = Depends(require_role(["admin", "moderator"]))):
    crud.remove_tag_from_problem(db, data.problem_id, data.tag_id)

@router.get("/problem/{problem_id}", response_model=list[schemas.ProblemTagMapResponse])
def get_tags_for_problem(problem_id: UUID, db: Session = Depends(get_db)):
    return crud.get_tags_by_problem(db, problem_id)
