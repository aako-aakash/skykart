"""
SKYKART — Cart Router
──────────────────────
All endpoints require authentication.

  GET    /api/v1/cart              → get current cart
  POST   /api/v1/cart/items        → add item
  PATCH  /api/v1/cart/items/{id}   → update quantity
  DELETE /api/v1/cart/items/{id}   → remove item
  DELETE /api/v1/cart              → clear entire cart
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.cart.service import CartService
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CartService.get_cart(db, current_user)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_200_OK)
def add_to_cart(
    data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CartService.add_item(db, current_user, data)


@router.patch("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: UUID,
    data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CartService.update_item(db, current_user, item_id, data)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CartService.remove_item(db, current_user, item_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    CartService.clear_cart(db, current_user)
