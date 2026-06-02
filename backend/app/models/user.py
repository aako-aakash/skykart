"""
SKYKART — User Model
──────────────────────
The central user table. Stores both customers and admins.

Design decisions:
  - Role stored as a PostgreSQL native ENUM for type safety at DB level
  - Password is NEVER stored plain — only the bcrypt hash
  - is_active flag allows soft-disabling accounts without deleting data
  - is_verified for future email verification flow
"""

import enum
from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class UserRole(str, enum.Enum):
    """
    User roles for role-based access control (RBAC).
    str mixin allows direct comparison with string values.
    """
    USER = "user"
    ADMIN = "admin"


class User(Base, UUIDMixin, TimestampMixin):
    """
    Core user table.

    Relationships:
      - One user → many CartItems  (via user_id FK)
      - One user → many Orders     (via user_id FK)
      - One user → many Addresses  (via user_id FK)
      - One user → many Reviews    (via user_id FK)
    """

    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────────────────────────
    email = Column(
        String(255),
        unique=True,
        index=True,       # Indexed — login queries filter by email
        nullable=False,
    )
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)

    # ── Auth ──────────────────────────────────────────────────────────────────
    password_hash = Column(String(255), nullable=False)

    # ── Access Control ────────────────────────────────────────────────────────
    role = Column(
        Enum(UserRole),
        default=UserRole.USER,
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    # lazy="dynamic" not used — prefer explicit joins in service layer
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
