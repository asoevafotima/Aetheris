from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from contests.crud import get_contest_by_id
from datetime import datetime
import uuid

router = APIRouter(prefix="/contest-participants", tags=["contest-participants"])


@router.post("/register/{contest_id}", response_model=schemas.ContestParticipantResponse)
def register(contest_id: str, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    contest = get_contest_by_id(db, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    if not contest.is_public and current_user.role not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Contest is private")
    from contests.models import ContestStatus
    if contest.status == ContestStatus.finished or contest.status == ContestStatus.cancelled:
        raise HTTPException(status_code=400, detail="Contest is already finished")

    return crud.register_participant(db, str(current_user.id), str(contest_id))


@router.delete("/unregister/{contest_id}", status_code=204)
def unregister(contest_id: str, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    crud.unregister_participant(db, str(contest_id), str(current_user.id))


@router.get("/me/{contest_id}", response_model=schemas.ContestParticipantResponse)
def my_registration(contest_id: str, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    p = crud.get_participant(db, str(contest_id), str(current_user.id))
    if not p:
        raise HTTPException(status_code=404, detail="Not registered")
    return p


@router.get("/{contest_id}", response_model=list[schemas.ContestParticipantResponse])
def list_participants(contest_id: str, db: Session = Depends(get_db)):
    return crud.get_participants_by_contest(db, contest_id)
