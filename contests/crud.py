from sqlalchemy.orm import Session
from .models import Contest, ContestStatus
from .schemas import ContestCreate, ContestUpdate
from slugify import slugify
from datetime import datetime
import uuid


def _to_uuid(val) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def _sync_status(db: Session, contest: Contest) -> Contest:
    """Auto-transition contest status based on current UTC time."""
    if contest.status in (ContestStatus.upcoming, ContestStatus.running):
        now = datetime.utcnow()
        if contest.status == ContestStatus.upcoming and now >= contest.starts_at:
            contest.status = ContestStatus.running
            db.commit()
        elif contest.status == ContestStatus.running and now >= contest.ends_at:
            contest.status = ContestStatus.finished
            db.commit()
    return contest


def get_contest_by_id(db: Session, contest_id):
    c = db.query(Contest).filter(Contest.id == _to_uuid(contest_id)).first()
    return _sync_status(db, c) if c else None


def get_contest_by_slug(db: Session, slug: str):
    c = db.query(Contest).filter(Contest.slug == slug).first()
    return _sync_status(db, c) if c else None


def get_all_contests(db: Session, skip: int = 0, limit: int = 20, status: str = None):
    contests = db.query(Contest).filter(Contest.is_public == True).all()
    # Sync statuses before filtering
    for c in contests:
        _sync_status(db, c)
    query = db.query(Contest).filter(Contest.is_public == True)
    if status:
        query = query.filter(Contest.status == status)
    return query.order_by(Contest.starts_at.desc()).offset(skip).limit(limit).all()


def create_contest(db: Session, data: ContestCreate, author_id):
    slug = slugify(data.title)
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Contest).filter(Contest.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    db_contest = Contest(**data.model_dump(), slug=slug, author_id=_to_uuid(author_id))
    db.add(db_contest)
    db.commit()
    db.refresh(db_contest)
    return db_contest


def update_contest(db: Session, contest_id, data: ContestUpdate):
    db_contest = get_contest_by_id(db, contest_id)
    if not db_contest:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_contest, field, value)
    db.commit()
    db.refresh(db_contest)
    return db_contest


def delete_contest(db: Session, contest_id):
    db_contest = get_contest_by_id(db, contest_id)
    if db_contest:
        db.delete(db_contest)
        db.commit()
    return db_contest


def update_contest_status(db: Session, contest_id, status: ContestStatus):
    db_contest = get_contest_by_id(db, contest_id)
    if db_contest:
        db_contest.status = status
        db.commit()
    return db_contest
