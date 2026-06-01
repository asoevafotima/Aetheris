from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AIAnalysisCreate(BaseModel):
    submission_id: UUID
    analysis_type: str

class AIAnalysisResponse(BaseModel):
    id: UUID
    user_id: UUID
    submission_id: UUID
    analysis_type: str
    result: str
    tokens_used: int
    created_at: datetime

    class Config:
        from_attributes = True