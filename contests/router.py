from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role, decode_access_token
from users.models import User
from websocket_manager import manager
from contest_standings.crud import get_standings_by_contest
import uuid, json

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
                   current_user: User = Depends(get_current_user)):
    return crud.create_contest(db, data, current_user.id)


@router.patch("/{contest_id}", response_model=schemas.ContestResponse)
def update_contest(contest_id: UUID, data: schemas.ContestUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "moderator"]))):
    contest = crud.update_contest(db, contest_id, data)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    return contest


@router.delete("/{contest_id}", status_code=204)
def delete_contest(contest_id: UUID, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin"]))):
    crud.delete_contest(db, contest_id)


# ── WebSocket: standings ──────────────────────────────────────────

@router.websocket("/{contest_id}/ws")
async def standings_ws(contest_id: str, websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect_standings(contest_id, websocket)
    try:
        # Send current standings immediately on connect
        standings = get_standings_by_contest(db, contest_id)
        rows = [
            {
                "id": str(s.id),
                "user_id": str(s.user_id),
                "contest_id": str(s.contest_id),
                "score": s.score,
                "penalty": s.penalty,
                "rank": s.rank,
            }
            for s in standings
        ]
        await websocket.send_text(json.dumps({"type": "standings", "data": rows}))
        # Keep alive and wait for client ping
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_standings(contest_id, websocket)
    except Exception:
        manager.disconnect_standings(contest_id, websocket)


# ── WebSocket: chat ───────────────────────────────────────────────

@router.websocket("/{contest_id}/chat/ws")
async def chat_ws(
    contest_id: str,
    websocket: WebSocket,
    token: str = Query(None),
    db: Session = Depends(get_db),
):
    # Authenticate via token query param
    user_id = None
    username = None
    if token:
        uid_str = decode_access_token(token)
        if uid_str:
            from users.crud import get_user_by_id
            user = get_user_by_id(db, uuid.UUID(uid_str))
            if user and user.is_active:
                user_id = str(user.id)
                username = user.username

    await manager.connect_chat(contest_id, websocket)
    try:
        # Send message history on connect
        from chat_messages.crud import get_messages_by_contest
        messages = get_messages_by_contest(db, contest_id, 0, 100)
        history = [
            {
                "id": str(m.id),
                "user_id": str(m.user_id),
                "username": m.user.username if m.user else None,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
        await websocket.send_text(json.dumps({"type": "history", "messages": history}))

        # Listen for incoming messages
        while True:
            raw = await websocket.receive_text()
            if not user_id:
                continue  # не авторизован — только читаем

            try:
                data = json.loads(raw)
            except Exception:
                continue

            content = data.get("content", "").strip()
            if not content:
                continue

            # Save to DB
            from chat_messages.crud import create_message
            msg = create_message(db, uuid.UUID(user_id), content, uuid.UUID(contest_id))

            broadcast_data = {
                "type": "message",
                "id": str(msg.id),
                "user_id": user_id,
                "username": username,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }
            await manager.broadcast_chat(contest_id, broadcast_data)

    except WebSocketDisconnect:
        manager.disconnect_chat(contest_id, websocket)
    except Exception:
        manager.disconnect_chat(contest_id, websocket)
