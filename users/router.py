from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from .models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[schemas.UserShortResponse])
def list_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_all_users(db, skip, limit)

@router.patch("/me", response_model=schemas.UserResponse)
def update_me(data: schemas.UserUpdate, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return crud.update_user(db, current_user.id, data)

@router.delete("/me", status_code=204)
def delete_me(db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    crud.delete_user(db, current_user.id)