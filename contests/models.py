from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class ContestType(str, enum.Enum):
    icpc = "icpc"
    ioi = "ioi"
    rated = "rated"
    unrated = "unrated"

class ContestStatus(str, enum.Enum):
    upcoming = "upcoming"
    running = "running"
    finished = "finished"
    cancelled = "cancelled"

class Contest(Base):
    __tablename__ = "contests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    contest_type = Column(Enum(ContestType), default=ContestType.rated)
    status = Column(Enum(ContestStatus), default=ContestStatus.upcoming)
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=True)
    is_team_contest = Column(Boolean, default=False)
    max_participants = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User")
    problems = relationship("ContestProblem", back_populates="contest", cascade="all, delete-orphan")
    participants = relationship("ContestParticipant", back_populates="contest", cascade="all, delete-orphan")
    standings = relationship("ContestStanding", back_populates="contest", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="contest")
    team_contests = relationship("TeamContest", back_populates="contest")