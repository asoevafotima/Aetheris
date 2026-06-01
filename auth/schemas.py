from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class RegisterResponse(BaseModel):
    id: UUID
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True