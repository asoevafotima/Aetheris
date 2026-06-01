from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ContestStandingResponse(BaseModel):
    id: UUID
    contest_id: UUID
    user_id: UUID
    score: int
    penalty: int
    rank: Optional[int]
    updated_at: datetime

    class Config:
        from_attributes = True