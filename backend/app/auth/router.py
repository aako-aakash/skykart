"""
SKYKART — Auth Router
──────────────────────
HTTP endpoints for authentication.

Endpoints:
  POST /api/v1/auth/register         → create account
  POST /api/v1/auth/login            → login (JSON body)
  POST /api/v1/auth/login/form       → login (OAuth2 form — for Swagger UI)
  POST /api/v1/auth/refresh          → refresh access token
  GET  /api/v1/auth/me               → get current user profile
  POST /api/v1/auth/change-password  → change password
"""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserResponse, PasswordChange
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    AccessTokenResponse,
    MessageResponse,
)
from app.auth.service import AuthService
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.core.security import verify_password, hash_password
from app.core.exceptions import UnauthorizedException

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register(db, data)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password (JSON)",
)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.login(db, data.email, data.password)


@router.post(
    "/login/form",
    response_model=TokenResponse,
    summary="Login via OAuth2 form (used by Swagger UI)",
    include_in_schema=False,  # Hidden from public docs — internal Swagger only
)
def login_form(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return AuthService.login(db, form.username, form.password)


@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    summary="Get a new access token using a refresh token",
)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    return AuthService.refresh_access_token(db, data.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user's profile",
)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change current user's password",
)
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise UnauthorizedException("Current password is incorrect.")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return MessageResponse(message="Password updated successfully.")
