from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class UserWeakTopicResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: UUID
    fail_count: int
    last_failed_at: datetime

    class Config:
        from_attributes = True