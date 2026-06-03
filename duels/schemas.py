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
    difficulty: str = "easy"          # easy / medium / hard / expert
    is_rated: bool = True

class DuelResponse(BaseModel):
    id: UUID
    challenger_id: UUID
    challenger_username: Optional[str] = None
    opponent_id: Optional[UUID] = None
    opponent_username: Optional[str] = None
    problem_id: Optional[UUID] = None
    problem_title: Optional[str] = None
    problem_slug: Optional[str] = None
    difficulty: str
    status: DuelStatus
    result: Optional[DuelResult] = None
    time_limit_minutes: int
    is_rated: bool
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    created_at: datetime
    challenger_solved_at: Optional[datetime] = None
    opponent_solved_at: Optional[datetime] = None
    challenger_score: float = 0.0
    opponent_score: float = 0.0

    class Config:
        from_attributes = True
