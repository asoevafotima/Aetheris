from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ProblemBookmarkCreate(BaseModel):
    problem_id: UUID

class ProblemBookmarkResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True