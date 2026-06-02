"""
Import all models here so that:
  1. Alembic autogenerate can detect all tables
  2. SQLAlchemy relationship resolution works across modules
"""

from app.models.base import Base, UUIDMixin, TimestampMixin
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, OrderStatus, Address, Review
from app.models.payment import Payment, PaymentStatus, PaymentMethod

__all__ = [
    "Base", "UUIDMixin", "TimestampMixin",
    "User", "UserRole",
    "Product", "Category",
    "CartItem",
    "Order", "OrderItem", "OrderStatus", "Address", "Review",
    "Payment", "PaymentStatus", "PaymentMethod",
]
