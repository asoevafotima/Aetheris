from uuid import UUID
import json
import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db
from . import crud, schemas
from auth.router import get_current_user, decode_access_token
from users.models import User
from team_members.crud import add_member
from team_members.models import TeamRole
from websocket_manager import manager

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


# ── WebSocket: team chat ──────────────────────────────────────────

@router.websocket("/{team_id}/chat/ws")
async def team_chat_ws(
    team_id: str,
    websocket: WebSocket,
    token: str = Query(None),
    db: Session = Depends(get_db),
):
    user_id: str | None = None
    username: str | None = None
    if token:
        uid_str = decode_access_token(token)
        if uid_str:
            from users.crud import get_user_by_id
            user = get_user_by_id(db, _uuid.UUID(uid_str))
            if user and user.is_active:
                user_id = str(user.id)
                username = user.username

    await manager.connect_team_chat(team_id, websocket)
    try:
        # Send history on connect
        from chat_messages.crud import get_messages_by_team
        messages = get_messages_by_team(db, team_id, 0, 100)
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

        while True:
            raw = await websocket.receive_text()
            if not user_id:
                continue

            try:
                data = json.loads(raw)
            except Exception:
                continue

            content = data.get("content", "").strip()
            if not content:
                continue

            from chat_messages.crud import create_message
            msg = create_message(db, _uuid.UUID(user_id), content, team_id=_uuid.UUID(team_id))

            await manager.broadcast_team_chat(team_id, {
                "type": "message",
                "id": str(msg.id),
                "user_id": user_id,
                "username": username,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect_team_chat(team_id, websocket)
    except Exception:
        manager.disconnect_team_chat(team_id, websocket)
