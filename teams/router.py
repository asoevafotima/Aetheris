from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from team_members.crud import add_member
from team_members.models import TeamRole

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/", response_model=list[schemas.TeamResponse])
def list_teams(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_all_teams(db, skip, limit)

@router.get("/{slug}", response_model=schemas.TeamResponse)
def get_team(slug: str, db: Session = Depends(get_db)):
    team = crud.get_team_by_slug(db, slug)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/", response_model=schemas.TeamResponse, status_code=201)
def create_team(data: schemas.TeamCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    team = crud.create_team(db, data, current_user.id)
    add_member(db, team.id, current_user.id, TeamRole.owner)
    return team

@router.patch("/{team_id}", response_model=schemas.TeamResponse)
def update_team(team_id: UUID, data: schemas.TeamUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    team = crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(team.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return crud.update_team(db, team_id, data)

@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: UUID, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    team = crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(team.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    crud.delete_team(db, team_id)