from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/follows", tags=["follows"])

@router.post("/", response_model=schemas.FollowResponse, status_code=201)
def follow(data: schemas.FollowCreate, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    return crud.follow_user(db, current_user.id, data.following_id)

@router.delete("/{following_id}", status_code=204)
def unfollow(following_id: UUID, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    crud.unfollow_user(db, current_user.id, following_id)

@router.get("/following", response_model=list[schemas.FollowResponse])
def my_following(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.get_following(db, current_user.id)

@router.get("/followers", response_model=list[schemas.FollowResponse])
def my_followers(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.get_followers(db, current_user.id)