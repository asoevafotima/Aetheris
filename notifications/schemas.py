from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class NotificationType(str, Enum):
    submission_result = "submission_result"
    contest_start = "contest_start"
    contest_end = "contest_end"
    duel_request = "duel_request"
    duel_result = "duel_result"
    achievement = "achievement"
    team_invite = "team_invite"
    system = "system"

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    body: str
    is_read: bool
    payload: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True