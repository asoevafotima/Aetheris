from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum

class InvitationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"

class DuelInvitationCreate(BaseModel):
    duel_id: UUID
    to_user_id: UUID

class DuelInvitationResponse(BaseModel):
    id: UUID
    duel_id: UUID
    from_user_id: UUID
    to_user_id: UUID
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True