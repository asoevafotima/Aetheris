from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role
from users.models import User

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("/", response_model=list[schemas.AchievementResponse])
def list_achievements(db: Session = Depends(get_db)):
    return crud.get_all_achievements(db)

@router.post("/", response_model=schemas.AchievementResponse, status_code=201)
def create_achievement(data: schemas.AchievementCreate, db: Session = Depends(get_db),
                       current_user: User = Depends(require_role(["admin"]))):
    return crud.create_achievement(db, data)

@router.delete("/{achievement_id}", status_code=204)
def delete_achievement(achievement_id, db: Session = Depends(get_db),
                       current_user: User = Depends(require_role(["admin"]))):
    crud.delete_achievement(db, achievement_id)
    