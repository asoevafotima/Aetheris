from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AIHintCreate(BaseModel):
    problem_id: UUID
    submission_id: Optional[UUID] = None
    hint_type: str

class AIHintResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: UUID
    submission_id: Optional[UUID]
    hint_type: str
    response_text: str
    tokens_used: int
    created_at: datetime

    class Config:
        from_attributes = True