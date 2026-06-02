from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/team-members", tags=["team-members"])

@router.get("/{team_id}", response_model=list[schemas.TeamMemberResponse])
def list_members(team_id: UUID, db: Session = Depends(get_db)):
    return crud.get_members_by_team(db, team_id)

@router.post("/{team_id}/add", response_model=schemas.TeamMemberResponse)
def add_member(team_id: UUID, data: schemas.TeamMemberCreate, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    return crud.add_member(db, team_id, data.user_id)

@router.delete("/{team_id}/remove/{user_id}", status_code=204)
def remove_member(team_id: UUID, user_id: UUID, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    crud.remove_member(db, team_id, user_id)
    