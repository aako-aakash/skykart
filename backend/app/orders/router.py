"""
SKYKART — Orders Router

User endpoints:
  POST   /api/v1/orders                → checkout → create order
  GET    /api/v1/orders                → my order history
  GET    /api/v1/orders/{id}           → order detail
  POST   /api/v1/orders/{id}/cancel    → cancel order

Admin endpoints:
  GET    /api/v1/admin/orders          → all orders (with filter)
  PATCH  /api/v1/admin/orders/{id}/status → update order status
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database.session import get_db
from app.auth.dependencies import get_current_active_user, require_admin
from app.models.user import User
from app.models.order import OrderStatus
from app.orders.service import OrderService
from app.schemas.order import (
    CheckoutRequest,
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdate,
)

router = APIRouter(tags=["Orders"])


# ── User: Orders ──────────────────────────────────────────────────────────────

@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def place_order(
    data: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return OrderService.checkout(db, current_user, data)


@router.get("/orders", response_model=OrderListResponse)
def my_orders(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return OrderService.get_user_orders(db, current_user, page, per_page)


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return OrderService.get_order_detail(db, current_user, order_id)


@router.post("/orders/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return OrderService.cancel_order(db, current_user, order_id)


# ── Admin: Orders ─────────────────────────────────────────────────────────────

@router.get(
    "/admin/orders",
    response_model=OrderListResponse,
    dependencies=[Depends(require_admin)],
)
def admin_list_orders(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    order_status: Optional[OrderStatus] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    return OrderService.admin_list_orders(db, page, per_page, order_status)


@router.patch(
    "/admin/orders/{order_id}/status",
    response_model=OrderResponse,
    dependencies=[Depends(require_admin)],
)
def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    return OrderService.update_status(db, order_id, data.status)
