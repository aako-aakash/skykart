"""
SKYKART — Base Model Mixin
───────────────────────────
Provides shared columns to every SQLAlchemy model:
  - UUID primary key (safer than sequential int IDs — no enumeration attacks)
  - created_at / updated_at timestamps with automatic management

Why UUID over integer IDs?
  - IDs cannot be guessed or incremented by attackers
  - Works across distributed systems without collision
  - URLs like /orders/3 reveal business volume — UUID doesn't
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Custom declarative base — replaces the one from session.py.
    Import THIS Base in all models.
    """
    pass


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at columns.
    Apply to any model: class Product(Base, TimestampMixin): ...
    """
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UUIDMixin:
    """
    Mixin that adds a UUID primary key column.
    Using PostgreSQL's native UUID type for best performance.
    """
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
