from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User
from .models import InvitationStatus

router = APIRouter(prefix="/duel-invitations", tags=["duel-invitations"])

@router.post("/", response_model=schemas.DuelInvitationResponse, status_code=201)
def send_invitation(data: schemas.DuelInvitationCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    return crud.create_invitation(db, data, current_user.id)

@router.get("/me", response_model=list[schemas.DuelInvitationResponse])
def my_invitations(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    return crud.get_invitations_by_user(db, current_user.id)

@router.post("/{inv_id}/accept", response_model=schemas.DuelInvitationResponse)
def accept(inv_id: UUID, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    inv = crud.update_invitation_status(db, inv_id, InvitationStatus.accepted)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return inv

@router.post("/{inv_id}/decline", response_model=schemas.DuelInvitationResponse)
def decline(inv_id: UUID, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    inv = crud.update_invitation_status(db, inv_id, InvitationStatus.declined)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return inv