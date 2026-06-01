from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ContestParticipantCreate(BaseModel):
    contest_id: UUID

class ContestParticipantResponse(BaseModel):
    id: UUID
    contest_id: UUID
    user_id: UUID
    registered_at: datetime

    class Config:
        from_attributes = True