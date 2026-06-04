from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import Base, engine
import os
from dotenv import load_dotenv

load_dotenv()

def _run_migrations():
    """Add missing columns to existing tables (safe, idempotent)."""
    from sqlalchemy import text, inspect
    with engine.connect() as conn:
        insp = inspect(engine)

        # duels — new columns added in v2
        duel_cols = {c['name'] for c in insp.get_columns('duels')}
        migrations = [
            ("difficulty",           "ALTER TABLE duels ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'easy'"),
            ("challenger_solved_at", "ALTER TABLE duels ADD COLUMN challenger_solved_at DATETIME"),
            ("opponent_solved_at",   "ALTER TABLE duels ADD COLUMN opponent_solved_at DATETIME"),
            ("challenger_score",     "ALTER TABLE duels ADD COLUMN challenger_score FLOAT NOT NULL DEFAULT 0.0"),
            ("opponent_score",       "ALTER TABLE duels ADD COLUMN opponent_score FLOAT NOT NULL DEFAULT 0.0"),
        ]
        for col, sql in migrations:
            if col not in duel_cols:
                conn.execute(text(sql))

        # problems — difficulty_code and topic columns
        prob_cols = {c['name'] for c in insp.get_columns('problems')}
        if 'difficulty_code' not in prob_cols:
            conn.execute(text("ALTER TABLE problems ADD COLUMN difficulty_code VARCHAR(10)"))
        if 'topic' not in prob_cols:
            conn.execute(text("ALTER TABLE problems ADD COLUMN topic VARCHAR(100)"))

        conn.commit()

_run_migrations()

from auth.router import router as auth_router
from users.router import router as users_router
from user_profiles.router import router as user_profiles_router
from user_settings.router import router as user_settings_router
from problems.router import router as problems_router
from problem_tags.router import router as problem_tags_router
from problem_tag_map.router import router as problem_tag_map_router
from test_cases.router import router as test_cases_router
from editorial.router import router as editorial_router
from submissions.router import router as submissions_router
from submission_results.router import router as submission_results_router
from contests.router import router as contests_router
from contest_problems.router import router as contest_problems_router
from contest_participants.router import router as contest_participants_router
from contest_standings.router import router as contest_standings_router
from duels.router import router as duels_router
from duel_invitations.router import router as duel_invitations_router
from duel_ratings.router import router as duel_ratings_router
from teams.router import router as teams_router
from team_members.router import router as team_members_router
from team_contests.router import router as team_contests_router
from achievements.router import router as achievements_router
from user_achievements.router import router as user_achievements_router
from ratings.router import router as ratings_router
from ai_analysis.router import router as ai_analysis_router
from ai_hints.router import router as ai_hints_router
from training_plans.router import router as training_plans_router
from training_plan_items.router import router as training_plan_items_router
from notifications.router import router as notifications_router
from chat_messages.router import router as chat_messages_router
from algorithm_visualizations.router import router as algorithm_visualizations_router
from user_weak_topics.router import router as user_weak_topics_router
from problem_bookmarks.router import router as problem_bookmarks_router
from follows.router import router as follows_router
from audit_logs.router import router as audit_logs_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aetheris",
    description="Олимпиадная платформа нового поколения",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "change-me")
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(user_profiles_router)
app.include_router(user_settings_router)
app.include_router(problems_router)
app.include_router(problem_tags_router)
app.include_router(problem_tag_map_router)
app.include_router(test_cases_router)
app.include_router(editorial_router)
app.include_router(submissions_router)
app.include_router(submission_results_router)
app.include_router(contests_router)
app.include_router(contest_problems_router)
app.include_router(contest_participants_router)
app.include_router(contest_standings_router)
app.include_router(duels_router)
app.include_router(duel_invitations_router)
app.include_router(duel_ratings_router)
app.include_router(teams_router)
app.include_router(team_members_router)
app.include_router(team_contests_router)
app.include_router(achievements_router)
app.include_router(user_achievements_router)
app.include_router(ratings_router)
app.include_router(ai_analysis_router)
app.include_router(ai_hints_router)
app.include_router(training_plans_router)
app.include_router(training_plan_items_router)
app.include_router(notifications_router)
app.include_router(chat_messages_router)
app.include_router(algorithm_visualizations_router)
app.include_router(user_weak_topics_router)
app.include_router(problem_bookmarks_router)
app.include_router(follows_router)
app.include_router(audit_logs_router)

@app.get("/")
def root():
    return {"message": "CodeArena API is running"}