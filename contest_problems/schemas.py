from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ProblemBrief(BaseModel):
    id: UUID
    title: str
    slug: str
    difficulty: str

    class Config:
        from_attributes = True


class ContestProblemCreate(BaseModel):
    contest_id: UUID
    problem_id: UUID
    label: str
    order_num: int = 0
    max_score: int = 100


class ContestProblemUpdate(BaseModel):
    label: Optional[str] = None
    order_num: Optional[int] = None
    max_score: Optional[int] = None


class ContestProblemResponse(BaseModel):
    id: UUID
    contest_id: UUID
    problem_id: UUID
    label: str
    order_num: int
    max_score: int
    problem: Optional[ProblemBrief] = None

    class Config:
        from_attributes = True
