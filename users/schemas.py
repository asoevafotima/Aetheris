from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    user = "user"
    admin = "admin"
    moderator = "moderator"

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserShortResponse(BaseModel):
    id: UUID
    username: str

    class Config:
        from_attributes = True