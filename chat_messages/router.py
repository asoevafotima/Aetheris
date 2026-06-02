from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from websocket_manager import manager
import asyncio

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=schemas.ChatMessageResponse, status_code=201)
async def send_message(data: schemas.ChatMessageCreate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    msg = crud.create_message(db, current_user.id, data.content,
                              data.contest_id, data.duel_id)

    # Broadcast via WebSocket if it's a contest message
    if data.contest_id:
        broadcast_data = {
            "type": "message",
            "id": str(msg.id),
            "user_id": str(msg.user_id),
            "username": current_user.username,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        }
        await manager.broadcast_chat(str(data.contest_id), broadcast_data)

    return msg


@router.get("/contest/{contest_id}", response_model=list[schemas.ChatMessageResponse])
def contest_chat(contest_id: UUID, skip: int = 0, limit: int = 50,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return crud.get_messages_by_contest(db, contest_id, skip, limit)


@router.get("/duel/{duel_id}", response_model=list[schemas.ChatMessageResponse])
def duel_chat(duel_id: UUID, skip: int = 0, limit: int = 50,
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return crud.get_messages_by_duel(db, duel_id, skip, limit)


@router.delete("/{message_id}", status_code=204)
def delete_message(message_id: UUID, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    crud.delete_message(db, message_id)
