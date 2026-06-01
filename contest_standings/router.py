from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role
from users.models import User

router = APIRouter(prefix="/contest-standings", tags=["contest-standings"])

@router.get("/{contest_id}", response_model=list[schemas.ContestStandingResponse])
def get_standings(contest_id, db: Session = Depends(get_db)):
    return crud.get_standings_by_contest(db, contest_id)

@router.post("/{contest_id}/recalculate", status_code=204)
def recalculate_ranks(contest_id, db: Session = Depends(get_db),
                      current_user: User = Depends(require_role(["admin"]))):
    crud.update_ranks(db, contest_id)
    