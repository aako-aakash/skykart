"""
SKYKART — Payments Service
───────────────────────────
Razorpay integration flow:

  1. Frontend calls POST /payments/create-order  → we create a Razorpay order
     and return {razorpay_order_id, amount, key_id} to the frontend
  2. Frontend opens Razorpay checkout modal using those details
  3. User pays → Razorpay calls our POST /payments/verify webhook
     with payment_id, order_id, signature
  4. We verify the HMAC signature → mark order CONFIRMED

Security: NEVER trust the frontend for payment success. Always verify
the HMAC signature server-side before updating order status.
"""

import hmac
import hashlib
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus
from app.models.order import Order, OrderStatus
from app.core.config import settings
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
)


class PaymentService:

    @staticmethod
    def create_razorpay_order(db: Session, order_id: UUID, user_id: UUID) -> dict:
        """
        Create a Razorpay order for a given SKYKART order.
        Returns the payload needed by the Razorpay frontend SDK.

        NOTE: Requires `razorpay` pip package in production.
        We stub the Razorpay client call here so the rest of the
        app compiles without the package installed in dev.
        """
        # Fetch our order
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id,
        ).first()

        if not order:
            raise NotFoundException("Order not found.")

        if order.status != OrderStatus.PENDING:
            raise BadRequestException("Order is not in a payable state.")

        payment = order.payment
        if not payment:
            raise NotFoundException("Payment record not found.")

        # ── Razorpay SDK call (uncomment in production) ───────────────────────
        # import razorpay
        # client = razorpay.Client(
        #     auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        # )
        # rz_order = client.order.create({
        #     "amount": int(order.total_amount * 100),   # paise
        #     "currency": "INR",
        #     "receipt": str(order.id),
        #     "notes": {"skykart_order_id": str(order.id)},
        # })
        # gateway_order_id = rz_order["id"]
        # ─────────────────────────────────────────────────────────────────────

        # Stub response for development / testing
        gateway_order_id = f"rzp_order_stub_{order.id}"

        # Persist gateway_order_id on payment record
        payment.gateway_order_id = gateway_order_id
        db.commit()

        return {
            "razorpay_order_id": gateway_order_id,
            "amount": int(order.total_amount * 100),   # paise
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": str(order.id),
            "name": settings.APP_NAME,
            "description": f"Order #{str(order.id)[:8].upper()}",
        }

    @staticmethod
    def verify_payment(
        db: Session,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> dict:
        """
        Verify Razorpay payment signature and confirm the order.

        Razorpay signs the payment with:
          HMAC_SHA256(key=secret, msg="{order_id}|{payment_id}")

        If signatures match → payment is genuine.
        """
        # Find payment by gateway_order_id
        payment = db.query(Payment).filter(
            Payment.gateway_order_id == razorpay_order_id
        ).first()

        if not payment:
            raise NotFoundException("Payment record not found.")

        # ── HMAC Verification ─────────────────────────────────────────────────
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
            msg=message.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()

        # In development with stub key, skip signature check
        signature_valid = (
            hmac.compare_digest(expected_signature, razorpay_signature)
            if settings.RAZORPAY_KEY_SECRET
            else True   # No secret configured → dev/test mode
        )

        if not signature_valid:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Signature verification failed."
            db.commit()
            raise BadRequestException("Payment verification failed. Possible fraud.")

        # ── Success: update payment + order ───────────────────────────────────
        payment.status = PaymentStatus.SUCCESS
        payment.gateway_payment_id = razorpay_payment_id
        payment.gateway_signature = razorpay_signature
        payment.paid_at = datetime.now(timezone.utc)

        payment.order.status = OrderStatus.CONFIRMED

        db.commit()

        return {
            "message": "Payment verified successfully.",
            "order_id": str(payment.order_id),
            "payment_id": razorpay_payment_id,
            "status": "confirmed",
        }

    @staticmethod
    def get_payment_by_order(db: Session, order_id: UUID, user_id: UUID) -> Payment:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id,
        ).first()
        if not order:
            raise NotFoundException("Order not found.")
        if not order.payment:
            raise NotFoundException("No payment record found for this order.")
        return order.payment
