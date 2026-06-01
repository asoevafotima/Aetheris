from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=True)
    max_members = Column(Integer, default=5)
    rating = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    team_contests = relationship("TeamContest", back_populates="team")