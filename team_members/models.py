from sqlalchemy import Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class TeamRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(TeamRole), default=TeamRole.member)
    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    user = relationship("User")
    