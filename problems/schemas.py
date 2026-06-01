from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional, List

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"

class ProblemStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"

class ProblemCreate(BaseModel):
    title: str
    description: str
    input_format: str
    output_format: str
    constraints: str
    difficulty: Difficulty
    time_limit_ms: int = 2000
    memory_limit_mb: int = 256
    is_public: bool = True

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    status: Optional[ProblemStatus] = None
    time_limit_ms: Optional[int] = None
    memory_limit_mb: Optional[int] = None
    is_public: Optional[bool] = None

class ProblemResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: str
    input_format: str
    output_format: str
    constraints: str
    difficulty: Difficulty
    status: ProblemStatus
    time_limit_ms: int
    memory_limit_mb: int
    author_id: UUID
    solve_count: int
    attempt_count: int
    rating: float
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProblemShortResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    difficulty: Difficulty
    solve_count: int
    rating: float

    class Config:
        from_attributes = True