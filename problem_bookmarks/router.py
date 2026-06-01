from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

@router.get("/", response_model=list[schemas.ProblemBookmarkResponse])
def my_bookmarks(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.get_bookmarks_by_user(db, current_user.id, skip, limit)

@router.post("/", response_model=schemas.ProblemBookmarkResponse, status_code=201)
def add_bookmark(data: schemas.ProblemBookmarkCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.add_bookmark(db, current_user.id, data.problem_id)

@router.delete("/{problem_id}", status_code=204)
def remove_bookmark(problem_id, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    crud.remove_bookmark(db, current_user.id, problem_id)