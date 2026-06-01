from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon_url = Column(String(500), nullable=True)
    condition_key = Column(String(100), nullable=False)
    condition_value = Column(String(100), nullable=False)
    is_hidden = Column(Boolean, default=False)

    user_achievements = relationship("UserAchievement", back_populates="achievement")