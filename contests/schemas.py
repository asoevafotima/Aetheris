from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class ContestType(str, Enum):
    icpc = "icpc"
    ioi = "ioi"
    rated = "rated"
    unrated = "unrated"

class ContestStatus(str, Enum):
    upcoming = "upcoming"
    running = "running"
    finished = "finished"
    cancelled = "cancelled"

class ContestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    contest_type: ContestType = ContestType.rated
    starts_at: datetime
    ends_at: datetime
    is_public: bool = True
    max_participants: Optional[int] = None

class ContestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ContestStatus] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_public: Optional[bool] = None
    max_participants: Optional[int] = None

class ContestResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str]
    contest_type: ContestType
    status: ContestStatus
    starts_at: datetime
    ends_at: datetime
    author_id: UUID
    is_public: bool
    max_participants: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True