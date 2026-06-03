from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class InvitationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"

class UserBrief(BaseModel):
    id: UUID
    username: str
    class Config:
        from_attributes = True

class DuelBrief(BaseModel):
    id: UUID
    difficulty: str
    time_limit_minutes: int
    class Config:
        from_attributes = True

class DuelInvitationCreate(BaseModel):
    duel_id: UUID
    to_user_id: UUID

class DuelInvitationResponse(BaseModel):
    id: UUID
    duel_id: UUID
    from_user_id: UUID
    to_user_id: UUID
    from_user: Optional[UserBrief] = None
    duel: Optional[DuelBrief] = None
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
