from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/duels", tags=["duels"])

@router.post("/", response_model=schemas.DuelResponse, status_code=201)
def create_duel(data: schemas.DuelCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return crud.create_duel(db, data, current_user.id)

@router.get("/active", response_model=list[schemas.DuelResponse])
def list_active(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_active_duels(db, skip, limit)

@router.get("/me", response_model=list[schemas.DuelResponse])
def my_duels(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    return crud.get_duels_by_user(db, current_user.id, skip, limit)

@router.get("/{duel_id}", response_model=schemas.DuelResponse)
def get_duel(duel_id, db: Session = Depends(get_db)):
    duel = crud.get_duel_by_id(db, duel_id)
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")
    return duel

@router.post("/{duel_id}/accept", response_model=schemas.DuelResponse)
def accept_duel(duel_id, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    duel = crud.accept_duel(db, duel_id, current_user.id)
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")
    return duel

@router.post("/{duel_id}/cancel", status_code=204)
def cancel_duel(duel_id, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    crud.cancel_duel(db, duel_id)