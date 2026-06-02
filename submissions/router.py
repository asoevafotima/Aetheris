from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from . import crud, schemas
from .judge import judge_submission
from auth.router import get_current_user
from users.models import User

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/", response_model=schemas.SubmissionResponse, status_code=201)
def submit(
    data: schemas.SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = crud.create_submission(db, data, current_user.id)
    background_tasks.add_task(judge_submission, sub.id, SessionLocal)
    return sub


@router.get("/me", response_model=list[schemas.SubmissionShortResponse])
def my_submissions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_submissions_by_user(db, current_user.id, skip, limit)


@router.get("/problem/{problem_id}", response_model=list[schemas.SubmissionShortResponse])
def submissions_by_problem(
    problem_id: UUID,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    return crud.get_submissions_by_problem(db, problem_id, skip, limit)


@router.get("/{submission_id}", response_model=schemas.SubmissionDetailResponse)
def get_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = crud.get_submission_by_id(db, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if str(sub.user_id) != str(current_user.id) and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return sub
