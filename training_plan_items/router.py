from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/training-plan-items", tags=["training-plan-items"])

@router.get("/plan/{plan_id}", response_model=list[schemas.TrainingPlanItemResponse])
def get_items(plan_id, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return crud.get_items_by_plan(db, plan_id)

@router.post("/", response_model=schemas.TrainingPlanItemResponse, status_code=201)
def add_item(data: schemas.TrainingPlanItemCreate, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    return crud.create_item(db, data)

@router.patch("/{item_id}", response_model=schemas.TrainingPlanItemResponse)
def update_item(item_id, data: schemas.TrainingPlanItemUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    item = crud.update_item(db, item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/{item_id}", status_code=204)
def delete_item(item_id, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    crud.delete_item(db, item_id)