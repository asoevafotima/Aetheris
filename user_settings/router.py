from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/me", response_model=schemas.UserSettingsResponse)
def get_my_settings(db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    settings = crud.get_settings_by_user_id(db, current_user.id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.patch("/me", response_model=schemas.UserSettingsResponse)
def update_my_settings(data: schemas.UserSettingsUpdate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    settings = crud.update_settings(db, current_user.id, data)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings