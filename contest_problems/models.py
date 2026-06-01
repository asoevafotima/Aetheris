from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class ContestProblem(Base):
    __tablename__ = "contest_problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    label = Column(String(5), nullable=False)
    order_num = Column(Integer, default=0)
    max_score = Column(Integer, default=100)

    contest = relationship("Contest", back_populates="problems")
    problem = relationship("Problem")