from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ProblemTagCreate(BaseModel):
    name: str
    slug: str
    color: Optional[str] = "#6366f1"

class ProblemTagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class ProblemTagResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    color: str

    class Config:
        from_attributes = True