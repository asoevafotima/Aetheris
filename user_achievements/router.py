from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/user-achievements", tags=["user-achievements"])

@router.get("/me", response_model=list[schemas.UserAchievementResponse])
def my_achievements(db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    return crud.get_achievements_by_user(db, current_user.id)

@router.get("/{user_id}", response_model=list[schemas.UserAchievementResponse])
def user_achievements(user_id, db: Session = Depends(get_db)):
    return crud.get_achievements_by_user(db, user_id)
