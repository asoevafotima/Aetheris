from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class FollowCreate(BaseModel):
    following_id: UUID

class FollowResponse(BaseModel):
    id: UUID
    follower_id: UUID
    following_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True