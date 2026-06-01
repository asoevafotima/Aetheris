from sqlalchemy import Column, Integer, Float, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base

class ResultStatus(str, enum.Enum):
    accepted = "accepted"
    wrong_answer = "wrong_answer"
    time_limit = "time_limit"
    memory_limit = "memory_limit"
    runtime_error = "runtime_error"

class SubmissionResult(Base):
    __tablename__ = "submission_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    test_case_id = Column(UUID(as_uuid=True), ForeignKey("test_cases.id"), nullable=False)
    status = Column(Enum(ResultStatus), nullable=False)
    time_ms = Column(Integer, nullable=True)
    memory_mb = Column(Float, nullable=True)
    actual_output = Column(Text, nullable=True)

    submission = relationship("Submission", back_populates="results")
    test_case = relationship("TestCase", back_populates="submission_results")
    