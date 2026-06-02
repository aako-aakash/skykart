"""
SKYKART — User Schemas (Pydantic v2)
──────────────────────────────────────
Schemas define what the API accepts and returns — completely decoupled
from the SQLAlchemy models.

Pattern used:
  UserBase       → shared fields
  UserCreate     → registration (includes password)
  UserUpdate     → partial profile update (all optional)
  UserResponse   → what the API returns (NEVER includes password_hash)
  UserInDB       → internal use only (includes hashed_password for auth)

Why separate schemas from models?
  - Models are DB representations; schemas are API contracts
  - Prevents accidental password_hash leakage in responses
  - Input validation happens at schema level before hitting the DB
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.user import UserRole


# ── Base ──────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


# ── Create (Registration) ─────────────────────────────────────────────────────

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """
        Basic password policy:
          - At least 8 chars (enforced by Field min_length)
          - At least one digit
          - At least one letter
        Extend this for stricter requirements.
        """
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_no_special(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank.")
        return v


# ── Update (Profile Edit) ─────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


# ── Password Change ───────────────────────────────────────────────────────────

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Response (safe — no password) ────────────────────────────────────────────

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    phone: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}   # Pydantic v2 ORM mode


# ── Admin: list/manage users ──────────────────────────────────────────────────

class UserAdminResponse(UserResponse):
    """Extended response for admin endpoints — includes all fields."""
    updated_at: datetime
