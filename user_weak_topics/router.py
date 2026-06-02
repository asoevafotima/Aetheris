from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/weak-topics", tags=["weak-topics"])

@router.get("/me", response_model=list[schemas.UserWeakTopicResponse])
def my_weak_topics(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    return crud.get_weak_topics_by_user(db, current_user.id)

@router.delete("/{problem_id}", status_code=204)
def remove_weak_topic(problem_id: UUID, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    crud.delete_weak_topic(db, current_user.id, problem_id)
    