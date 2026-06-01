from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum

class TeamRole(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class TeamMemberCreate(BaseModel):
    user_id: UUID

class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    role: TeamRole
    joined_at: datetime

    class Config:
        from_attributes = True