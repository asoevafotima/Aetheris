from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from . import crud, schemas
from auth.router import require_role, get_current_user, decode_access_token
from users.models import User
from contests.crud import get_contest_by_id
from datetime import datetime
import uuid

router = APIRouter(prefix="/contest-problems", tags=["contest-problems"])


def _get_optional_user(request: Request, db: Session = Depends(get_db)):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[len("Bearer "):]
    uid_str = decode_access_token(token)
    if not uid_str:
        return None
    from users.crud import get_user_by_id
    user = get_user_by_id(db, uuid.UUID(uid_str))
    return user if (user and user.is_active) else None


@router.get("/{contest_id}", response_model=list[schemas.ContestProblemResponse])
def get_problems(contest_id: str, request: Request, db: Session = Depends(get_db)):
    contest = get_contest_by_id(db, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    current_user = _get_optional_user(request, db)
    now = datetime.utcnow()
    is_organizer = current_user and (
        str(current_user.id) == str(contest.author_id)
        or current_user.role in ("admin", "moderator")
    )

    if now < contest.starts_at and not is_organizer:
        raise HTTPException(status_code=403, detail="Contest has not started yet")

    return crud.get_problems_by_contest(db, contest_id)


@router.post("/", response_model=schemas.ContestProblemResponse, status_code=201)
def add_problem(data: schemas.ContestProblemCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    contest = get_contest_by_id(db, str(data.contest_id))
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    is_author = str(current_user.id) == str(contest.author_id)
    is_staff = current_user.role in ("admin", "moderator")
    if not is_author and not is_staff:
        raise HTTPException(status_code=403, detail="Only the contest author can add problems")
    return crud.add_problem_to_contest(db, data)


@router.patch("/{cp_id}", response_model=schemas.ContestProblemResponse)
def update_problem(cp_id, data: schemas.ContestProblemUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    cp = crud.get_contest_problem_by_id(db, cp_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Not found")
    contest = get_contest_by_id(db, str(cp.contest_id))
    is_author = contest and str(current_user.id) == str(contest.author_id)
    if not is_author and current_user.role not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return crud.update_contest_problem(db, cp_id, data)


@router.delete("/{cp_id}", status_code=204)
def remove_problem(cp_id, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    cp = crud.get_contest_problem_by_id(db, cp_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Not found")
    contest = get_contest_by_id(db, str(cp.contest_id))
    is_author = contest and str(current_user.id) == str(contest.author_id)
    if not is_author and current_user.role not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Forbidden")
    crud.remove_problem_from_contest(db, cp_id)
