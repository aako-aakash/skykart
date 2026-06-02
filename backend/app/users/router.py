"""
SKYKART — Users Router
────────────────────────
Endpoints for user profile management and saved delivery addresses.

Endpoints:
  GET    /api/v1/users/profile          → get profile
  PATCH  /api/v1/users/profile          → update profile
  GET    /api/v1/users/addresses        → list saved addresses
  POST   /api/v1/users/addresses        → add new address
  PUT    /api/v1/users/addresses/{id}   → update address
  DELETE /api/v1/users/addresses/{id}   → delete address
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.order import Address
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.order import AddressCreate, AddressResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Addresses ─────────────────────────────────────────────────────────────────

@router.get("/addresses", response_model=List[AddressResponse])
def list_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return db.query(Address).filter(Address.user_id == current_user.id).all()


@router.post("/addresses", response_model=AddressResponse, status_code=201)
def add_address(
    data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # If setting as default, unset all others first
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update(
            {"is_default": False}
        )
    address = Address(**data.model_dump(), user_id=current_user.id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/addresses/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: UUID,
    data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise NotFoundException("Address not found.")
    if address.user_id != current_user.id:
        raise ForbiddenException("Not your address.")
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update(
            {"is_default": False}
        )
    for field, value in data.model_dump().items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}", status_code=204)
def delete_address(
    address_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise NotFoundException("Address not found.")
    if address.user_id != current_user.id:
        raise ForbiddenException("Not your address.")
    db.delete(address)
    db.commit()
