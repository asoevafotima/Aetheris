from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/duel-ratings", tags=["duel-ratings"])

@router.get("/me", response_model=list[schemas.DuelRatingResponse])
def my_ratings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    return crud.get_ratings_by_user(db, current_user.id, skip, limit)

@router.get("/duel/{duel_id}", response_model=list[schemas.DuelRatingResponse])
def duel_ratings(duel_id: UUID, db: Session = Depends(get_db)):
    return crud.get_ratings_by_duel(db, duel_id)