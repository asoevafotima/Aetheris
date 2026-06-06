from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class TeamRole(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class TeamMemberCreate(BaseModel):
    user_id: UUID

class MemberUserBrief(BaseModel):
    id: UUID
    username: str
    role: str

    class Config:
        from_attributes = True

class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    role: TeamRole
    joined_at: datetime
    user: Optional[MemberUserBrief] = None

    class Config:
        from_attributes = True