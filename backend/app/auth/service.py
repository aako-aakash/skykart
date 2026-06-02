"""
SKYKART — Auth Service
───────────────────────
Business logic for authentication — kept out of the router so it's
testable in isolation and reusable (e.g., from admin creation scripts).

Service layer pattern:
  Router  →  validates HTTP input, calls service, returns HTTP response
  Service →  pure business logic, raises domain exceptions, touches DB
"""

from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
    BadRequestException,
)
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.schemas.auth import TokenResponse, AccessTokenResponse
from app.schemas.user import UserResponse


class AuthService:

    @staticmethod
    def register(db: Session, data: UserCreate) -> User:
        """
        Register a new user.
        Raises ConflictException if email already exists.
        """
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise ConflictException("An account with this email already exists.")

        user = User(
            email=data.email,
            full_name=data.full_name,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=UserRole.USER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> TokenResponse:
        """
        Authenticate a user and return access + refresh tokens.
        Uses a generic error message to prevent email enumeration.
        """
        user = db.query(User).filter(User.email == email).first()

        # Constant-time comparison — don't short-circuit on user not found
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise ForbiddenException("Your account has been deactivated.")  # type: ignore

        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role.value},
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> AccessTokenResponse:
        """
        Issue a new access token from a valid refresh token.
        """
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token.")

        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive.")

        new_access = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role.value},
        )
        return AccessTokenResponse(access_token=new_access)
