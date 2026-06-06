from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from .models import Rating
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry])
def leaderboard(limit: int = 100, db: Session = Depends(get_db)):
    subq = (
        db.query(Rating.user_id, func.sum(Rating.delta).label("total"))
        .group_by(Rating.user_id)
        .subquery()
    )
    rows = (
        db.query(User, subq.c.total)
        .outerjoin(subq, User.id == subq.c.user_id)
        .filter(User.is_active == True)
        .order_by(func.coalesce(subq.c.total, 0).desc())
        .limit(limit)
        .all()
    )
    return [
        schemas.LeaderboardEntry(
            user_id=u.id,
            username=u.username,
            role=u.role.value if hasattr(u.role, 'value') else str(u.role),
            rating=int(total or 0),
            created_at=u.created_at,
        )
        for u, total in rows
    ]

@router.get("/me", response_model=list[schemas.RatingResponse])
def my_rating_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    return crud.get_rating_history_by_user(db, current_user.id, skip, limit)

@router.get("/{user_id}", response_model=list[schemas.RatingResponse])
def user_rating_history(user_id: UUID, skip: int = 0, limit: int = 20,
                        db: Session = Depends(get_db)):
    return crud.get_rating_history_by_user(db, user_id, skip, limit)
