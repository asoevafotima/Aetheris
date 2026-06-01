from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.get("/me", response_model=list[schemas.RatingResponse])
def my_rating_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    return crud.get_rating_history_by_user(db, current_user.id, skip, limit)

@router.get("/{user_id}", response_model=list[schemas.RatingResponse])
def user_rating_history(user_id, skip: int = 0, limit: int = 20,
                        db: Session = Depends(get_db)):
    return crud.get_rating_history_by_user(db, user_id, skip, limit)
