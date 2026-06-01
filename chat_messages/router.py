from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=schemas.ChatMessageResponse, status_code=201)
def send_message(data: schemas.ChatMessageCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.create_message(db, current_user.id, data.content,
                               data.contest_id, data.duel_id)

@router.get("/contest/{contest_id}", response_model=list[schemas.ChatMessageResponse])
def contest_chat(contest_id, skip: int = 0, limit: int = 50,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.get_messages_by_contest(db, contest_id, skip, limit)

@router.get("/duel/{duel_id}", response_model=list[schemas.ChatMessageResponse])
def duel_chat(duel_id, skip: int = 0, limit: int = 50,
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return crud.get_messages_by_duel(db, duel_id, skip, limit)

@router.delete("/{message_id}", status_code=204)
def delete_message(message_id, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    crud.delete_message(db, message_id)
    