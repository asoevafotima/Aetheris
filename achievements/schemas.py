from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class AchievementCreate(BaseModel):
    name: str
    description: str
    icon_url: Optional[str] = None
    condition_key: str
    condition_value: str
    is_hidden: bool = False

class AchievementResponse(BaseModel):
    id: UUID
    name: str
    description: str
    icon_url: Optional[str]
    condition_key: str
    condition_value: str
    is_hidden: bool

    class Config:
        from_attributes = True