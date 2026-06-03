from sqlalchemy.orm import Session
from .models import TrainingPlanItem, ItemStatus
from .schemas import TrainingPlanItemCreate, TrainingPlanItemUpdate
from datetime import datetime
import uuid

def create_item(db: Session, data: TrainingPlanItemCreate):
    db_item = TrainingPlanItem(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_item_by_id(db: Session, item_id: uuid.UUID):
    return db.query(TrainingPlanItem).filter(TrainingPlanItem.id == item_id).first()

def get_items_by_plan(db: Session, plan_id: uuid.UUID):
    from sqlalchemy.orm import selectinload
    return db.query(TrainingPlanItem).options(
        selectinload(TrainingPlanItem.problem)
    ).filter(
        TrainingPlanItem.plan_id == plan_id
    ).order_by(TrainingPlanItem.order_num).all()

def update_item(db: Session, item_id: uuid.UUID, data: TrainingPlanItemUpdate):
    db_item = get_item_by_id(db, item_id)
    if not db_item:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    if data.status == ItemStatus.completed:
        db_item.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: uuid.UUID):
    db_item = get_item_by_id(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item