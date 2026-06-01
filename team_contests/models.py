from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class TeamContest(Base):
    __tablename__ = "team_contests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0)
    rank = Column(Integer, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="team_contests")
    contest = relationship("Contest", back_populates="team_contests")
    