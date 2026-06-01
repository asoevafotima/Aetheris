from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class DuelRating(Base):
    __tablename__ = "duel_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    duel_id = Column(UUID(as_uuid=True), ForeignKey("duels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    old_rating = Column(Integer, nullable=False)
    new_rating = Column(Integer, nullable=False)
    delta = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    duel = relationship("Duel", back_populates="duel_rating")
    user = relationship("User")
    