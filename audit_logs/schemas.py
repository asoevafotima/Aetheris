from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    target_type: str
    target_id: Optional[UUID] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
