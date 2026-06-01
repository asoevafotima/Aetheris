from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=list[schemas.NotificationResponse])
def my_notifications(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    return crud.get_notifications_by_user(db, current_user.id, skip, limit)

@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return {"count": crud.get_unread_count(db, current_user.id)}

@router.post("/{notification_id}/read", status_code=204)
def mark_read(notification_id, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    crud.mark_as_read(db, notification_id)

@router.post("/read-all", status_code=204)
def mark_all_read(db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    crud.mark_all_as_read(db, current_user.id)

@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    crud.delete_notification(db, notification_id)