from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class ProblemTagMap(Base):
    __tablename__ = "problem_tag_map"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("problem_tags.id", ondelete="CASCADE"), nullable=False)

    problem = relationship("Problem", back_populates="tag_map")
    tag = relationship("ProblemTag", back_populates="tag_map")
    