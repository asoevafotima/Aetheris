from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class RatingResponse(BaseModel):
    id: UUID
    user_id: UUID
    contest_id: Optional[UUID]
    old_rating: int
    new_rating: int
    delta: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_id: UUID
    username: str
    role: str
    rating: int
    created_at: datetime