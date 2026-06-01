from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id"), nullable=True)
    old_rating = Column(Integer, nullable=False)
    new_rating = Column(Integer, nullable=False)
    delta = Column(Integer, nullable=False)
    reason = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    contest = relationship("Contest")