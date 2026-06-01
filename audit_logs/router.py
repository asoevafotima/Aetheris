from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user, require_role
from users.models import User

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@router.get("/", response_model=list[schemas.AuditLogResponse])
def all_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db),
             current_user: User = Depends(require_role(["admin"]))):
    return crud.get_all_logs(db, skip, limit)

@router.get("/me", response_model=list[schemas.AuditLogResponse])
def my_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return crud.get_logs_by_user(db, current_user.id, skip, limit)