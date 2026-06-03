from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FollowCreate(BaseModel):
    following_id: UUID

class UserBrief(BaseModel):
    id: UUID
    username: str
    class Config:
        from_attributes = True

class FollowResponse(BaseModel):
    id: UUID
    follower_id: UUID
    following_id: UUID
    following_user: Optional[UserBrief] = None
    created_at: datetime

    class Config:
        from_attributes = True
