from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ChatMessageCreate(BaseModel):
    content: str
    contest_id: Optional[UUID] = None
    duel_id: Optional[UUID] = None

class ChatMessageResponse(BaseModel):
    id: UUID
    user_id: UUID
    contest_id: Optional[UUID]
    duel_id: Optional[UUID]
    content: str
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True