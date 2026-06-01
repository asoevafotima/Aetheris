from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/contest-participants", tags=["contest-participants"])

@router.post("/register/{contest_id}", response_model=schemas.ContestParticipantResponse)
def register(contest_id, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    return crud.register_participant(db, contest_id, current_user.id)

@router.delete("/unregister/{contest_id}", status_code=204)
def unregister(contest_id, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    crud.unregister_participant(db, contest_id, current_user.id)

@router.get("/{contest_id}", response_model=list[schemas.ContestParticipantResponse])
def list_participants(contest_id, db: Session = Depends(get_db)):
    return crud.get_participants_by_contest(db, contest_id)