"""
SKYKART — Admin Router
───────────────────────
All endpoints require ADMIN role.

  GET  /api/v1/admin/stats              → dashboard summary stats
  GET  /api/v1/admin/users              → paginated user list
  GET  /api/v1/admin/users/{id}         → single user detail
  PATCH /api/v1/admin/users/{id}/role   → change user role
  PATCH /api/v1/admin/users/{id}/status → activate/deactivate user
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List

from app.database.session import get_db
from app.auth.dependencies import require_admin
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.payment import Payment, PaymentStatus
from app.schemas.user import UserAdminResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


# ── Schemas ───────────────────────────────────────────────────────────────────

class RoleUpdate(BaseModel):
    role: UserRole


class StatusUpdate(BaseModel):
    is_active: bool


class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    pending_orders: int
    revenue_total: float
    revenue_today: float


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
def dashboard_stats(db: Session = Depends(get_db)):
    """
    Key metrics for the admin dashboard overview.
    All queries are simple aggregates — fast even at scale.
    For high-traffic sites, cache this endpoint (Redis, 60s TTL).
    """
    from datetime import date, datetime, timezone

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.PENDING
    ).scalar() or 0

    revenue_total = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).scalar() or 0.0

    today_start = datetime.combine(date.today(), datetime.min.time()).replace(
        tzinfo=timezone.utc
    )
    revenue_today = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.SUCCESS,
        Payment.paid_at >= today_start,
    ).scalar() or 0.0

    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        revenue_total=float(revenue_total),
        revenue_today=float(revenue_today),
    )


# ── User Management ───────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserAdminResponse])
def list_users(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    role: Optional[UserRole] = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if search:
        term = f"%{search}%"
        q = q.filter(
            (User.email.ilike(term)) | (User.full_name.ilike(term))
        )
    if role:
        q = q.filter(User.role == role)
    q = q.order_by(User.created_at.desc())
    return q.offset((page - 1) * per_page).limit(per_page).all()


@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")
    return user


@router.patch("/users/{user_id}/role", response_model=UserAdminResponse)
def update_user_role(
    user_id: UUID,
    data: RoleUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/status", response_model=UserAdminResponse)
def update_user_status(
    user_id: UUID,
    data: StatusUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found.")
    user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user
