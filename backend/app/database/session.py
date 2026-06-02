"""
SKYKART — Database Session
───────────────────────────
Sets up SQLAlchemy with:
  - A single Engine (connection pool) shared across the app
  - A SessionLocal factory for creating DB sessions per request
  - A declarative Base that all models inherit from

Why use a session-per-request pattern?
  - Each HTTP request gets its own transaction scope
  - Session is closed/rolled back automatically after the request
  - Prevents connection leaks and dirty reads between requests

Usage in FastAPI routes:
    from app.database.session import get_db
    ...
    def my_route(db: Session = Depends(get_db)):
        ...
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator

from app.core.config import settings

# ── Engine ────────────────────────────────────────────────────────────────────
# pool_pre_ping=True: test connections before using them (handles DB restarts)
# pool_size / max_overflow: tune based on expected concurrent requests
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,  # Logs SQL in development, silent in production
)

# ── Session Factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,  # Explicit commit required — we control transactions
    autoflush=False,   # Don't flush until we explicitly do or commit
)

# ── Declarative Base ──────────────────────────────────────────────────────────
# All SQLAlchemy models inherit from this Base.
Base = declarative_base()


# ── Dependency ────────────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a DB session per request.

    The session is automatically closed in the finally block,
    even if an exception is raised inside the route handler.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
