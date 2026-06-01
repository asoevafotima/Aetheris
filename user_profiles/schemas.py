from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: UUID
    user_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True