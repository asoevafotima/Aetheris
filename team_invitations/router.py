from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from .models import TeamInvitationStatus
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/team-invitations", tags=["team-invitations"])

@router.post("/", status_code=201)
def send_invitation(data: schemas.TeamInvitationCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    # Check not already in team or already invited
    existing = db.query(__import__('team_invitations.models', fromlist=['TeamInvitation']).TeamInvitation).filter_by(
        team_id=data.team_id, to_user_id=data.to_user_id, status=TeamInvitationStatus.pending
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Invitation already sent")
    inv = crud.create_invitation(db, data.team_id, current_user.id, data.to_user_id)
    return {"id": str(inv.id), "status": inv.status, "team_id": str(inv.team_id), "to_user_id": str(inv.to_user_id)}

@router.get("/me")
def my_invitations(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    invs = crud.get_pending_for_user(db, current_user.id)
    return [
        {
            "id": str(i.id),
            "status": i.status,
            "team_id": str(i.team_id),
            "from_user_id": str(i.from_user_id),
            "to_user_id": str(i.to_user_id),
            "created_at": i.created_at.isoformat(),
            "team": {"id": str(i.team.id), "name": i.team.name, "slug": i.team.slug} if i.team else None,
            "from_user": {"id": str(i.from_user.id), "username": i.from_user.username} if i.from_user else None,
        }
        for i in invs
    ]

@router.post("/{inv_id}/accept")
def accept(inv_id: UUID, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    inv = crud.get_invitation_by_id(db, inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if str(inv.to_user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your invitation")
    if inv.status != TeamInvitationStatus.pending:
        raise HTTPException(status_code=400, detail="Already processed")

    # Add to team
    from team_members.crud import add_member
    from team_members.models import TeamRole
    try:
        add_member(db, inv.team_id, current_user.id, TeamRole.member)
    except Exception:
        pass

    crud.update_status(db, inv_id, TeamInvitationStatus.accepted)
    return {"status": "accepted"}

@router.post("/{inv_id}/decline")
def decline(inv_id: UUID, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    inv = crud.get_invitation_by_id(db, inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    crud.update_status(db, inv_id, TeamInvitationStatus.declined)
    return {"status": "declined"}
