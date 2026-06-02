"""
SKYKART — Auth Dependencies
─────────────────────────────
FastAPI dependency injection for authentication and authorization.

Three levels of protection:
  1. get_current_user     → any authenticated user (valid JWT required)
  2. get_current_active_user → authenticated + account is active
  3. require_admin        → authenticated + role == ADMIN

Usage in any router:
    @router.get("/profile")
    def profile(user: User = Depends(get_current_active_user)):
        ...

    @router.delete("/products/{id}")
    def delete(id: UUID, user: User = Depends(require_admin)):
        ...
"""

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.database.session import get_db
from app.models.user import User, UserRole

# Tells FastAPI where clients send the bearer token.
# The tokenUrl is the login endpoint path.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/form")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT, look up the user in the DB.
    Raises 401 if token is invalid, expired, or user doesn't exist.
    """
    payload = decode_token(token)
    if payload is None:
        raise UnauthorizedException("Invalid or expired token.")

    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload is malformed.")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthorizedException("User not found.")

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Extends get_current_user — also checks is_active flag.
    Use this for all standard user-facing endpoints.
    """
    if not current_user.is_active:
        raise ForbiddenException("Your account has been deactivated.")
    return current_user


def require_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Admin-only guard. Use on any admin endpoint.
    Returns the user if admin, raises 403 otherwise.
    """
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Admin access required.")
    return current_user
