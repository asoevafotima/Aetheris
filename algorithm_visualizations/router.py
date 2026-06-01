from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

@router.get("/", response_model=list[schemas.AlgorithmVisualizationResponse])
def list_visualizations(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_all_visualizations(db, skip, limit)

@router.get("/{vis_id}", response_model=schemas.AlgorithmVisualizationResponse)
def get_visualization(vis_id, db: Session = Depends(get_db)):
    vis = crud.get_visualization_by_id(db, vis_id)
    if not vis:
        raise HTTPException(status_code=404, detail="Not found")
    return vis

@router.post("/", response_model=schemas.AlgorithmVisualizationResponse, status_code=201)
def create_visualization(data: schemas.AlgorithmVisualizationCreate,
                         db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    return crud.create_visualization(db, data, current_user.id)

@router.patch("/{vis_id}", response_model=schemas.AlgorithmVisualizationResponse)
def update_visualization(vis_id, data: schemas.AlgorithmVisualizationUpdate,
                         db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    vis = crud.update_visualization(db, vis_id, data)
    if not vis:
        raise HTTPException(status_code=404, detail="Not found")
    return vis

@router.delete("/{vis_id}", status_code=204)
def delete_visualization(vis_id, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    crud.delete_visualization(db, vis_id)