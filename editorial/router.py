from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/editorials", tags=["editorials"])

@router.get("/problem/{problem_id}", response_model=schemas.EditorialResponse)
def get_editorial(problem_id, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    editorial = crud.get_editorial_by_problem(db, problem_id)
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial not found")
    if not editorial.is_public and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return editorial

@router.post("/", response_model=schemas.EditorialResponse, status_code=201)
def create_editorial(data: schemas.EditorialCreate, db: Session = Depends(get_db),
                     current_user: User = Depends(require_role(["admin", "moderator"]))):
    return crud.create_editorial(db, data, current_user.id)

@router.patch("/{editorial_id}", response_model=schemas.EditorialResponse)
def update_editorial(editorial_id, data: schemas.EditorialUpdate, db: Session = Depends(get_db),
                     current_user: User = Depends(require_role(["admin", "moderator"]))):
    editorial = crud.update_editorial(db, editorial_id, data)
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial not found")
    return editorial

@router.delete("/{editorial_id}", status_code=204)
def delete_editorial(editorial_id, db: Session = Depends(get_db),
                     current_user: User = Depends(require_role(["admin"]))):
    crud.delete_editorial(db, editorial_id)