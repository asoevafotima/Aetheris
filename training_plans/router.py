from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/training-plans", tags=["training-plans"])

@router.get("/", response_model=list[schemas.TrainingPlanResponse])
def my_plans(db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    return crud.get_plans_by_user(db, current_user.id)

@router.get("/{plan_id}", response_model=schemas.TrainingPlanResponse)
def get_plan(plan_id: UUID, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    plan = crud.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/", response_model=schemas.TrainingPlanResponse, status_code=201)
def create_plan(data: schemas.TrainingPlanCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return crud.create_plan(db, data, current_user.id)

@router.patch("/{plan_id}", response_model=schemas.TrainingPlanResponse)
def update_plan(plan_id: UUID, data: schemas.TrainingPlanUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    plan = crud.update_plan(db, plan_id, data)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: UUID, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    crud.delete_plan(db, plan_id)