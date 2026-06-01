from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class UserSettingsBase(BaseModel):
    theme: Optional[str] = "dark"
    language: Optional[str] = "en"
    editor_font_size: Optional[str] = "14"
    editor_theme: Optional[str] = "vs-dark"
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    show_online_status: Optional[bool] = True
    show_rating: Optional[bool] = True

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsResponse(UserSettingsBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True