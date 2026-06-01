from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TestCaseCreate(BaseModel):
    problem_id: UUID
    input_data: str
    expected_output: str
    is_sample: bool = False
    order_num: int = 0
    score: int = 1

class TestCaseUpdate(BaseModel):
    input_data: Optional[str] = None
    expected_output: Optional[str] = None
    is_sample: Optional[bool] = None
    order_num: Optional[int] = None
    score: Optional[int] = None

class TestCaseResponse(BaseModel):
    id: UUID
    problem_id: UUID
    input_data: str
    expected_output: str
    is_sample: bool
    order_num: int
    score: int

    class Config:
        from_attributes = True

class TestCaseSampleResponse(BaseModel):
    id: UUID
    input_data: str
    expected_output: str

    class Config:
        from_attributes = True