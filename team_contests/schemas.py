from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class TeamContestCreate(BaseModel):
    team_id: UUID
    contest_id: UUID

class TeamContestResponse(BaseModel):
    id: UUID
    team_id: UUID
    contest_id: UUID
    score: int
    rank: Optional[int]
    registered_at: datetime

    class Config:
        from_attributes = True