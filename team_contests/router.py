from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/team-contests", tags=["team-contests"])

@router.post("/register", response_model=schemas.TeamContestResponse)
def register_team(data: schemas.TeamContestCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    return crud.register_team(db, data.team_id, data.contest_id)

@router.get("/contest/{contest_id}", response_model=list[schemas.TeamContestResponse])
def teams_in_contest(contest_id: UUID, db: Session = Depends(get_db)):
    return crud.get_teams_by_contest(db, contest_id)

@router.get("/team/{team_id}", response_model=list[schemas.TeamContestResponse])
def team_contests(team_id: UUID, db: Session = Depends(get_db)):
    return crud.get_contests_by_team(db, team_id)