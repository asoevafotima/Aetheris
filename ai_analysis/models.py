from sqlalchemy import Column, Text, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    analysis_type = Column(String(50), nullable=False)
    result = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    submission = relationship("Submission")