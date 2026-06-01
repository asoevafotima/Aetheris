from sqlalchemy import Column, Boolean, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=False)
    order_num = Column(Integer, default=0)
    score = Column(Integer, default=1)

    problem = relationship("Problem", back_populates="test_cases")
    submission_results = relationship("SubmissionResult", back_populates="test_case")