from pydantic import BaseModel
from uuid import UUID
from enum import Enum
from typing import Optional

class ResultStatus(str, Enum):
    accepted = "accepted"
    wrong_answer = "wrong_answer"
    time_limit = "time_limit"
    memory_limit = "memory_limit"
    runtime_error = "runtime_error"

class SubmissionResultResponse(BaseModel):
    id: UUID
    submission_id: UUID
    test_case_id: UUID
    status: ResultStatus
    time_ms: Optional[int]
    memory_mb: Optional[float]
    actual_output: Optional[str]

    class Config:
        from_attributes = True