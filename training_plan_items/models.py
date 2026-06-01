from sqlalchemy import Column, Integer, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class ItemStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    skipped = "skipped"

class TrainingPlanItem(Base):
    __tablename__ = "training_plan_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("training_plans.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)
    order_num = Column(Integer, default=0)
    status = Column(Enum(ItemStatus), default=ItemStatus.pending)
    completed_at = Column(DateTime, nullable=True)

    plan = relationship("TrainingPlan", back_populates="items")
    problem = relationship("Problem")