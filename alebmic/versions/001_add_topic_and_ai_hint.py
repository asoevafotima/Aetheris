"""add topic to problems and ai_hint to submissions

Revision ID: 001
Revises:
Create Date: 2026-06-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = "001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _existing_columns(table: str) -> list[str]:
    conn = op.get_bind()
    return [c["name"] for c in inspect(conn).get_columns(table)]


def upgrade() -> None:
    prob_cols = _existing_columns("problems")

    if "topic" not in prob_cols:
        op.add_column("problems", sa.Column("topic", sa.String(100), nullable=True))
        op.create_index("ix_problems_topic", "problems", ["topic"])

    # SQLite does not support ALTER COLUMN — VARCHAR length is not enforced anyway

    sub_cols = _existing_columns("submissions")
    if "ai_hint" not in sub_cols:
        op.add_column("submissions", sa.Column("ai_hint", sa.Text(), nullable=True))


def downgrade() -> None:
    # SQLite does not support DROP COLUMN in older versions; skip silently
    try:
        op.drop_index("ix_problems_topic", table_name="problems")
        op.drop_column("problems", "topic")
        op.drop_column("submissions", "ai_hint")
    except Exception:
        pass
