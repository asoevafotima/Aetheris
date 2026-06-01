from sqlalchemy import Column, String, DateTime, Integer, Float, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    accepted = "accepted"
    wrong_answer = "wrong_answer"
    time_limit = "time_limit"
    memory_limit = "memory_limit"
    runtime_error = "runtime_error"
    compile_error = "compile_error"
    system_error = "system_error"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    contest_id = Column(UUID(as_uuid=True), ForeignKey("contests.id"), nullable=True)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.pending)
    time_ms = Column(Integer, nullable=True)
    memory_mb = Column(Float, nullable=True)
    score = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
    contest = relationship("Contest", back_populates="submissions")
    results = relationship("SubmissionResult", back_populates="submission", cascade="all, delete-orphan")