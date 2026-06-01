from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class ContestParticipant(Base):
    __tablename__ = "contest_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)

    contest = relationship("Contest", back_populates="participants")
    user = relationship("User")
    