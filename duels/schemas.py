from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class DuelStatus(str, Enum):
    pending = "pending"
    active = "active"
    finished = "finished"
    cancelled = "cancelled"

class DuelResult(str, Enum):
    challenger_win = "challenger_win"
    opponent_win = "opponent_win"
    draw = "draw"

class DuelCreate(BaseModel):
    problem_id: UUID
    time_limit_minutes: int = 30
    is_rated: bool = True

class DuelResponse(BaseModel):
    id: UUID
    challenger_id: UUID
    opponent_id: Optional[UUID]
    problem_id: UUID
    status: DuelStatus
    result: Optional[DuelResult]
    time_limit_minutes: int
    is_rated: bool
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True