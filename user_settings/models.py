from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="dark")
    language = Column(String(10), default="en")
    editor_font_size = Column(String(5), default="14")
    editor_theme = Column(String(50), default="vs-dark")
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    show_online_status = Column(Boolean, default=True)
    show_rating = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")