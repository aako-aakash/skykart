"""
SKYKART — Payment Model
─────────────────────────
Stores Razorpay (and future gateway) transaction records.

Design decisions:
  - One-to-one with Order (uselist=False on Order side)
  - gateway_order_id: the ID we create on Razorpay before showing the checkout
  - gateway_payment_id: returned by Razorpay after the user pays
  - gateway_signature: the HMAC signature we verify to confirm authenticity
  - Storing both allows full audit trail for disputes/refunds
"""

import enum
from sqlalchemy import Column, String, Numeric, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey

from app.models.base import Base, UUIDMixin, TimestampMixin


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    RAZORPAY = "razorpay"
    STRIPE = "stripe"       # Future
    WALLET = "wallet"       # Future
    COD = "cod"             # Cash on delivery


class Payment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payments"

    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,   # One payment record per order
        index=True,
    )
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)

    method = Column(Enum(PaymentMethod), default=PaymentMethod.RAZORPAY, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)

    # Gateway fields (Razorpay-specific; nullable for COD or future gateways)
    gateway_order_id = Column(String(100), nullable=True)    # rzp_order_xxx
    gateway_payment_id = Column(String(100), nullable=True)  # pay_xxx
    gateway_signature = Column(String(500), nullable=True)   # HMAC for verification

    paid_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(String(500), nullable=True)

    # Relationship
    order = relationship("Order", back_populates="payment")

    def __repr__(self):
        return f"<Payment order={self.order_id} status={self.status} amount={self.amount}>"
