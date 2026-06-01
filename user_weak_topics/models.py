from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class UserWeakTopic(Base):
    __tablename__ = "user_weak_topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    fail_count = Column(Integer, default=1)
    last_failed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="weak_topics")
    problem = relationship("Problem", back_populates="weak_topics")