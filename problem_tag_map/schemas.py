from pydantic import BaseModel
from uuid import UUID

class ProblemTagMapCreate(BaseModel):
    problem_id: UUID
    tag_id: UUID

class ProblemTagMapResponse(BaseModel):
    id: UUID
    problem_id: UUID
    tag_id: UUID

    class Config:
        from_attributes = True