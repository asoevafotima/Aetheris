from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/me", response_model=schemas.UserProfileResponse)
def get_my_profile(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    profile = crud.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/{user_id}", response_model=schemas.UserProfileResponse)
def get_profile(user_id, db: Session = Depends(get_db)):
    profile = crud.get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("/me", response_model=schemas.UserProfileResponse)
def update_my_profile(data: schemas.UserProfileUpdate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    profile = crud.update_profile(db, current_user.id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile