from sqlalchemy import Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class InvitationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"

class DuelInvitation(Base):
    __tablename__ = "duel_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    duel_id = Column(UUID(as_uuid=True), ForeignKey("duels.id", ondelete="CASCADE"), nullable=False)
    from_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(InvitationStatus), default=InvitationStatus.pending)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    duel = relationship("Duel", back_populates="invitations")
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
    