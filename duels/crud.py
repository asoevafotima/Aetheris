from sqlalchemy.orm import Session
from .models import Duel, DuelStatus, DuelResult
from .schemas import DuelCreate
import uuid, random
from datetime import datetime

# Лимит времени по сложности (минуты)
TIME_LIMITS = {
    "easy":   15,
    "medium": 25,
    "hard":   40,
    "expert": 60,
}

def _pick_random_problem(db: Session, difficulty: str):
    from problems.models import Problem
    problems = db.query(Problem).filter(
        Problem.difficulty == difficulty,
        Problem.is_public == True,
    ).all()
    if not problems:
        # Fallback — любая публичная задача
        problems = db.query(Problem).filter(Problem.is_public == True).all()
    return random.choice(problems) if problems else None

def _enrich(duel: Duel) -> Duel:
    """Attach computed string attributes for the response schema."""
    duel.challenger_username = duel.challenger.username if duel.challenger else None
    duel.opponent_username = duel.opponent.username if duel.opponent else None
    duel.problem_title = duel.problem.title if duel.problem else None
    duel.problem_slug = duel.problem.slug if duel.problem else None
    return duel

def create_duel(db: Session, data: DuelCreate, challenger_id: uuid.UUID):
    difficulty = data.difficulty if data.difficulty in TIME_LIMITS else "easy"
    problem = _pick_random_problem(db, difficulty)
    time_limit = TIME_LIMITS[difficulty]

    db_duel = Duel(
        challenger_id=challenger_id,
        problem_id=problem.id if problem else None,
        difficulty=difficulty,
        time_limit_minutes=time_limit,
        is_rated=data.is_rated,
    )
    db.add(db_duel)
    db.commit()
    db.refresh(db_duel)
    return _enrich(db_duel)

def get_duel_by_id(db: Session, duel_id: uuid.UUID):
    duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if duel:
        _check_expired(db, duel)
        _enrich(duel)
    return duel

def get_active_duels(db: Session, skip: int = 0, limit: int = 20):
    duels = db.query(Duel).filter(
        Duel.status == DuelStatus.pending
    ).order_by(Duel.created_at.desc()).offset(skip).limit(limit).all()
    for d in duels:
        _enrich(d)
    return duels

def get_duels_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    duels = db.query(Duel).filter(
        (Duel.challenger_id == user_id) | (Duel.opponent_id == user_id)
    ).order_by(Duel.created_at.desc()).offset(skip).limit(limit).all()
    for d in duels:
        _check_expired(db, d)
        _enrich(d)
    return duels

def start_duel(db: Session, duel_id: uuid.UUID, opponent_id: uuid.UUID):
    """Called when opponent accepts invitation."""
    db_duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if not db_duel or db_duel.status != DuelStatus.pending:
        return db_duel
    db_duel.opponent_id = opponent_id
    db_duel.status = DuelStatus.active
    db_duel.started_at = datetime.utcnow()
    db.commit()
    db.refresh(db_duel)
    return _enrich(db_duel)

def record_submission(db: Session, duel_id: uuid.UUID, user_id: uuid.UUID,
                      solved: bool, score: float):
    """Called from judge when a submission finishes during an active duel."""
    db_duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if not db_duel or db_duel.status != DuelStatus.active:
        return
    now = datetime.utcnow()
    is_challenger = str(db_duel.challenger_id) == str(user_id)

    if is_challenger:
        if score > db_duel.challenger_score:
            db_duel.challenger_score = score
        if solved and not db_duel.challenger_solved_at:
            db_duel.challenger_solved_at = now
    else:
        if score > db_duel.opponent_score:
            db_duel.opponent_score = score
        if solved and not db_duel.opponent_solved_at:
            db_duel.opponent_solved_at = now

    db.commit()
    # If both solved — finish immediately
    if db_duel.challenger_solved_at and db_duel.opponent_solved_at:
        _finish(db, db_duel)

def _check_expired(db: Session, duel: Duel):
    """Auto-finish if time limit exceeded."""
    if duel.status != DuelStatus.active or not duel.started_at:
        return
    elapsed = (datetime.utcnow() - duel.started_at).total_seconds() / 60
    if elapsed >= duel.time_limit_minutes:
        _finish(db, duel)

def _finish(db: Session, duel: Duel):
    duel.status = DuelStatus.finished
    duel.finished_at = datetime.utcnow()
    duel.result = _calc_result(duel)
    db.commit()

def _calc_result(duel: Duel) -> DuelResult:
    c_solved = duel.challenger_solved_at is not None
    o_solved = duel.opponent_solved_at is not None

    if c_solved and o_solved:
        # Оба решили — побеждает кто быстрее
        c_time = (duel.challenger_solved_at - duel.started_at).total_seconds()
        o_time = (duel.opponent_solved_at - duel.started_at).total_seconds()
        if c_time < o_time:
            return DuelResult.challenger_win
        elif o_time < c_time:
            return DuelResult.opponent_win
        return DuelResult.draw

    if c_solved:
        return DuelResult.challenger_win
    if o_solved:
        return DuelResult.opponent_win

    # Никто не решил — кто набрал больше баллов
    if duel.challenger_score > duel.opponent_score:
        return DuelResult.challenger_win
    elif duel.opponent_score > duel.challenger_score:
        return DuelResult.opponent_win
    return DuelResult.draw

def cancel_duel(db: Session, duel_id: uuid.UUID):
    db_duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if db_duel:
        db_duel.status = DuelStatus.cancelled
        db.commit()
    return db_duel
