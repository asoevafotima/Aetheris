from sqlalchemy.orm import Session
from .models import TrainingPlan
from .schemas import TrainingPlanCreate, TrainingPlanUpdate
import uuid

def create_plan(db: Session, data: TrainingPlanCreate, user_id: uuid.UUID):
    db_plan = TrainingPlan(**data.model_dump(), user_id=user_id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_plan_by_id(db: Session, plan_id: uuid.UUID):
    return db.query(TrainingPlan).filter(TrainingPlan.id == plan_id).first()

def get_plans_by_user(db: Session, user_id: uuid.UUID):
    return db.query(TrainingPlan).filter(
        TrainingPlan.user_id == user_id
    ).order_by(TrainingPlan.created_at.desc()).all()

def update_plan(db: Session, plan_id: uuid.UUID, data: TrainingPlanUpdate):
    db_plan = get_plan_by_id(db, plan_id)
    if not db_plan:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_plan, field, value)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def delete_plan(db: Session, plan_id: uuid.UUID):
    db_plan = get_plan_by_id(db, plan_id)
    if db_plan:
        db.delete(db_plan)
        db.commit()
    return db_plan