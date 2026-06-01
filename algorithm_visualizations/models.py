from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from datetime import datetime

class AlgorithmVisualization(Base):
    __tablename__ = "algorithm_visualizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    algorithm_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    animation_data = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem")
    author = relationship("User")