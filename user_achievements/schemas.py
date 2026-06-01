from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class UserAchievementResponse(BaseModel):
    id: UUID
    user_id: UUID
    achievement_id: UUID
    earned_at: datetime

    class Config:
        from_attributes = True