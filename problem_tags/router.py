from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role
from users.models import User

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("/", response_model=list[schemas.ProblemTagResponse])
def list_tags(db: Session = Depends(get_db)):
    return crud.get_all_tags(db)

@router.get("/{tag_id}", response_model=schemas.ProblemTagResponse)
def get_tag(tag_id: UUID, db: Session = Depends(get_db)):
    tag = crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("/", response_model=schemas.ProblemTagResponse, status_code=201)
def create_tag(data: schemas.ProblemTagCreate, db: Session = Depends(get_db),
               current_user: User = Depends(require_role(["admin"]))):
    return crud.create_tag(db, data)

@router.patch("/{tag_id}", response_model=schemas.ProblemTagResponse)
def update_tag(tag_id: UUID, data: schemas.ProblemTagUpdate, db: Session = Depends(get_db),
               current_user: User = Depends(require_role(["admin"]))):
    tag = crud.update_tag(db, tag_id, data)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.delete("/{tag_id}", status_code=204)
def delete_tag(tag_id: UUID, db: Session = Depends(get_db),
               current_user: User = Depends(require_role(["admin"]))):
    crud.delete_tag(db, tag_id)