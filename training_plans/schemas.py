from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class TrainingPlanCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_ai_generated: bool = False

class TrainingPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class TrainingPlanResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    is_ai_generated: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True