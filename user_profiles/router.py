import shutil
from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/profiles", tags=["profiles"])

AVATAR_DIR = Path("static/avatars")
ALLOWED_EXTS = {"jpg", "jpeg", "png", "gif", "webp"}


@router.get("/me", response_model=schemas.UserProfileResponse)
def get_my_profile(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    profile = crud.get_profile_by_user_id(db, current_user.id)
    if not profile:
        profile = crud.create_profile(db, current_user.id)
    return profile


@router.get("/{user_id}", response_model=schemas.UserProfileResponse)
def get_profile(user_id: UUID, db: Session = Depends(get_db)):
    profile = crud.get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=schemas.UserProfileResponse)
def update_my_profile(data: schemas.UserProfileUpdate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    profile = crud.get_profile_by_user_id(db, current_user.id)
    if not profile:
        crud.create_profile(db, current_user.id)
    return crud.update_profile(db, current_user.id, data)


@router.post("/me/avatar", response_model=schemas.UserProfileResponse)
def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Invalid image format")
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    dest = AVATAR_DIR / f"{current_user.id}.{ext}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    avatar_url = f"/static/avatars/{current_user.id}.{ext}"
    profile = crud.get_profile_by_user_id(db, current_user.id)
    if not profile:
        crud.create_profile(db, current_user.id)
    return crud.update_profile(db, current_user.id, schemas.UserProfileUpdate(avatar_url=avatar_url))