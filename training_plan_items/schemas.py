from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class ItemStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    skipped = "skipped"

class ProblemBrief(BaseModel):
    id: UUID
    title: str
    slug: str
    difficulty: str
    class Config:
        from_attributes = True

class TrainingPlanItemCreate(BaseModel):
    plan_id: UUID
    problem_id: UUID
    order_num: int = 0

class TrainingPlanItemUpdate(BaseModel):
    status: Optional[ItemStatus] = None
    order_num: Optional[int] = None

class TrainingPlanItemResponse(BaseModel):
    id: UUID
    plan_id: UUID
    problem_id: UUID
    problem: Optional[ProblemBrief] = None
    order_num: int
    status: ItemStatus
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
