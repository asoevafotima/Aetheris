from sqlalchemy import Column, Boolean, DateTime, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class DuelStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    finished = "finished"
    cancelled = "cancelled"

class DuelResult(str, enum.Enum):
    challenger_win = "challenger_win"
    opponent_win = "opponent_win"
    draw = "draw"

class Duel(Base):
    __tablename__ = "duels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenger_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    opponent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    status = Column(Enum(DuelStatus), default=DuelStatus.pending)
    result = Column(Enum(DuelResult), nullable=True)
    time_limit_minutes = Column(Integer, default=30)
    is_rated = Column(Boolean, default=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    challenger = relationship("User", foreign_keys=[challenger_id])
    opponent = relationship("User", foreign_keys=[opponent_id])
    problem = relationship("Problem")
    invitations = relationship("DuelInvitation", back_populates="duel", cascade="all, delete-orphan")
    duel_rating = relationship("DuelRating", back_populates="duel", cascade="all, delete-orphan")
    