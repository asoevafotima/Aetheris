from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")