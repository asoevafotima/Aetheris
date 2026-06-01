from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AlgorithmVisualizationCreate(BaseModel):
    problem_id: Optional[UUID] = None
    title: str
    algorithm_type: str
    description: Optional[str] = None
    animation_data: str
    is_public: bool = True

class AlgorithmVisualizationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    animation_data: Optional[str] = None
    is_public: Optional[bool] = None

class AlgorithmVisualizationResponse(BaseModel):
    id: UUID
    problem_id: Optional[UUID]
    title: str
    algorithm_type: str
    description: Optional[str]
    is_public: bool
    author_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True