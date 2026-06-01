from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    is_public: bool = True
    max_members: int = 5

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    is_public: Optional[bool] = None
    max_members: Optional[int] = None

class TeamResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    avatar_url: Optional[str]
    owner_id: UUID
    is_public: bool
    max_members: int
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True