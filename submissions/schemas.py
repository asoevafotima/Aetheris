from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional, List

class SubmissionStatus(str, Enum):
    pending = "pending"
    running = "running"
    accepted = "accepted"
    wrong_answer = "wrong_answer"
    time_limit = "time_limit"
    memory_limit = "memory_limit"
    runtime_error = "runtime_error"
    compile_error = "compile_error"
    system_error = "system_error"

class TestResultBrief(BaseModel):
    test_number: int
    status: str
    time_ms: Optional[int]
    passed: bool

class SubmissionCreate(BaseModel):
    problem_id: UUID
    contest_id: Optional[UUID] = None
    language: str
    code: str

class SubmissionResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: UUID
    contest_id: Optional[UUID]
    language: str
    status: SubmissionStatus
    time_ms: Optional[int]
    memory_mb: Optional[float]
    score: float
    error_message: Optional[str]
    ai_hint: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionDetailResponse(SubmissionResponse):
    test_results: List[TestResultBrief] = []

    class Config:
        from_attributes = True

class SubmissionShortResponse(BaseModel):
    id: UUID
    status: SubmissionStatus
    language: str
    created_at: datetime

    class Config:
        from_attributes = True
