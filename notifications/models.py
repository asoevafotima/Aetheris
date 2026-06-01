from sqlalchemy import Column, String, Boolean, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class NotificationType(str, enum.Enum):
    submission_result = "submission_result"
    contest_start = "contest_start"
    contest_end = "contest_end"
    duel_request = "duel_request"
    duel_result = "duel_result"
    achievement = "achievement"
    team_invite = "team_invite"
    system = "system"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")