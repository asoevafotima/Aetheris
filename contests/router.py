from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/contests", tags=["contests"])

@router.get("/", response_model=list[schemas.ContestResponse])
def list_contests(skip: int = 0, limit: int = 20,
                  status: str = Query(None), db: Session = Depends(get_db)):
    return crud.get_all_contests(db, skip, limit, status)

@router.get("/{slug}", response_model=schemas.ContestResponse)
def get_contest(slug: str, db: Session = Depends(get_db)):
    contest = crud.get_contest_by_slug(db, slug)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    return contest

@router.post("/", response_model=schemas.ContestResponse, status_code=201)
def create_contest(data: schemas.ContestCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.create_contest(db, data, current_user.id)

@router.patch("/{contest_id}", response_model=schemas.ContestResponse)
def update_contest(contest_id, data: schemas.ContestUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    contest = crud.update_contest(db, contest_id, data)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    return contest

@router.delete("/{contest_id}", status_code=204)
def delete_contest(contest_id, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin"]))):
    crud.delete_contest(db, contest_id)