from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from .models import TeamInvitationStatus

class TeamInvitationCreate(BaseModel):
    team_id: UUID
    to_user_id: UUID

class TeamInvitationResponse(BaseModel):
    id: UUID
    team_id: UUID
    from_user_id: UUID
    to_user_id: UUID
    status: TeamInvitationStatus
    created_at: datetime

    from_user: dict | None = None
    team: dict | None = None

    model_config = {"from_attributes": True}
