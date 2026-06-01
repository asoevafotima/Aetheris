from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DuelRatingResponse(BaseModel):
    id: UUID
    duel_id: UUID
    user_id: UUID
    old_rating: int
    new_rating: int
    delta: int
    created_at: datetime

    class Config:
        from_attributes = True