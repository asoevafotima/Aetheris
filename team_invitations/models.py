from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class TeamInvitationStatus(str, enum.Enum):
    pending  = "pending"
    accepted = "accepted"
    declined = "declined"

class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id     = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    from_user_id= Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id  = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status      = Column(Enum(TeamInvitationStatus), default=TeamInvitationStatus.pending)
    created_at  = Column(DateTime, default=datetime.utcnow)

    team      = relationship("Team")
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user   = relationship("User", foreign_keys=[to_user_id])
