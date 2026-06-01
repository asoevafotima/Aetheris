from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class ProblemTag(Base):
    __tablename__ = "problem_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    color = Column(String(7), default="#6366f1")

    tag_map = relationship("ProblemTagMap", back_populates="tag")
    