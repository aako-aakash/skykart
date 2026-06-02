"""
SKYKART — Order, Address & Review Models
──────────────────────────────────────────
Models:
  - Address:   User's saved delivery addresses
  - Order:     A placed order with status lifecycle
  - OrderItem: Line items snapshotting product price at time of purchase
  - Review:    Product review tied to a user

Key design decisions:
  - OrderItem stores unit_price as a SNAPSHOT — if the product price changes
    later, historical orders remain accurate. Never join to products.price
    for invoice data.
  - Order status is a PostgreSQL ENUM — DB enforces valid transitions,
    not just application code.
  - Review is linked to both user and product (not order) for simplicity.
    A production upgrade would link to order_item to verify purchase.
"""

import enum
from sqlalchemy import (
    Column, String, Text, Numeric, Integer,
    Boolean, ForeignKey, Enum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


# ── Address ───────────────────────────────────────────────────────────────────

class Address(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "addresses"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    line1 = Column(String(255), nullable=False)
    line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    country = Column(String(100), default="India", nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")

    def __repr__(self):
        return f"<Address {self.city}, {self.state} - {self.pincode}>"


# ── Order Status Enum ─────────────────────────────────────────────────────────

class OrderStatus(str, enum.Enum):
    PENDING = "pending"         # Created, awaiting payment
    CONFIRMED = "confirmed"     # Payment received
    PROCESSING = "processing"   # Being packed
    SHIPPED = "shipped"         # Dispatched to courier
    DELIVERED = "delivered"     # Received by customer
    CANCELLED = "cancelled"     # Cancelled before delivery
    REFUNDED = "refunded"       # Refund processed


# ── Order ─────────────────────────────────────────────────────────────────────

class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    address_id = Column(
        UUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="RESTRICT"),
        nullable=False,
    )
    status = Column(
        Enum(OrderStatus),
        default=OrderStatus.PENDING,
        nullable=False,
        index=True,   # Indexed — admin dashboard filters by status heavily
    )

    # Pricing snapshot at checkout time
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0, nullable=False)
    shipping_charge = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)

    coupon_code = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)

    def __repr__(self):
        return f"<Order id={self.id} status={self.status} total={self.total_amount}>"


# ── OrderItem ─────────────────────────────────────────────────────────────────

class OrderItem(Base, UUIDMixin, TimestampMixin):
    """
    Each line item in an order.
    Stores unit_price as a price SNAPSHOT — decoupled from live product price.
    """
    __tablename__ = "order_items"

    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    product_name = Column(String(255), nullable=False)   # Snapshot
    product_image = Column(String(500), nullable=True)   # Snapshot
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)  # Snapshot
    subtotal = Column(Numeric(10, 2), nullable=False)    # unit_price × quantity

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem product={self.product_name} qty={self.quantity}>"


# ── Review ────────────────────────────────────────────────────────────────────

class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rating = Column(Integer, nullable=False)   # 1–5
    title = Column(String(200), nullable=True)
    comment = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

    def __repr__(self):
        return f"<Review product={self.product_id} rating={self.rating}>"
