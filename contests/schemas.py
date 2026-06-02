from pydantic import BaseModel, model_validator
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

    @model_validator(mode='after')
    def validate_dates(self):
        # Strip timezone for comparison if needed
        s = self.starts_at.replace(tzinfo=None) if self.starts_at.tzinfo else self.starts_at
        e = self.ends_at.replace(tzinfo=None) if self.ends_at.tzinfo else self.ends_at
        if e <= s:
            raise ValueError('Дата и время конца контеста должны быть позже даты начала')
        return self

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