from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class ProblemBookmark(Base):
    __tablename__ = "problem_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    problem = relationship("Problem", back_populates="bookmarks")