from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/submission-results", tags=["submission-results"])

@router.get("/{submission_id}", response_model=list[schemas.SubmissionResultResponse])
def get_results(submission_id, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return crud.get_results_by_submission(db, submission_id)
