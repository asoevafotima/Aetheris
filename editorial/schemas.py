from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class EditorialCreate(BaseModel):
    problem_id: UUID
    content: str
    is_public: bool = False

class EditorialUpdate(BaseModel):
    content: Optional[str] = None
    is_public: Optional[bool] = None

class EditorialResponse(BaseModel):
    id: UUID
    problem_id: UUID
    author_id: UUID
    content: str
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True