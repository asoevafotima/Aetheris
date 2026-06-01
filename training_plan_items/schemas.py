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
    order_num: int
    status: ItemStatus
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True