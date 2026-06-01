from sqlalchemy.orm import Session
from .models import TeamContest
import uuid

def register_team(db: Session, team_id: uuid.UUID, contest_id: uuid.UUID):
    existing = db.query(TeamContest).filter(
        TeamContest.team_id == team_id,
        TeamContest.contest_id == contest_id
    ).first()
    if existing:
        return existing
    db_tc = TeamContest(team_id=team_id, contest_id=contest_id)
    db.add(db_tc)
    db.commit()
    db.refresh(db_tc)
    return db_tc

def get_teams_by_contest(db: Session, contest_id: uuid.UUID):
    return db.query(TeamContest).filter(TeamContest.contest_id == contest_id).all()

def get_contests_by_team(db: Session, team_id: uuid.UUID):
    return db.query(TeamContest).filter(TeamContest.team_id == team_id).all()

def update_team_score(db: Session, team_id: uuid.UUID, contest_id: uuid.UUID, score: int, rank: int):
    db_tc = db.query(TeamContest).filter(
        TeamContest.team_id == team_id,
        TeamContest.contest_id == contest_id
    ).first()
    if db_tc:
        db_tc.score = score
        db_tc.rank = rank
        db.commit()
        db.refresh(db_tc)
    return db_tc

def unregister_team(db: Session, team_id: uuid.UUID, contest_id: uuid.UUID):
    db_tc = db.query(TeamContest).filter(
        TeamContest.team_id == team_id,
        TeamContest.contest_id == contest_id
    ).first()
    if db_tc:
        db.delete(db_tc)
        db.commit()
    return db_tc