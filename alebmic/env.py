from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from database import Base

from users import models
from achievements import models
from ai_analysis import models
from ai_hints import models
from algorithm_visualizations import models
from audit_logs import models
from auth import models
from chat_messages import models
from contest_participants import models
from contest_problems import models
from contest_standings import models
from contests import models
from notifications import models
from duel_invitations import models
from duel_ratings import models
from duels import models
from editorial import models
from follows import models
from problem_bookmarks import models
from problem_tag_map import models
from problem_tags import models
from problems import models
from ratings import models
from submission_results import models
from submissions import models
from team_contests import models
from team_members import models
from teams import models
from test_cases import models
from training_plan_items import models
from training_plans import models
from user_achievements import models
from user_profiles import models
from user_settings import models 
from user_weak_topics import models


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
