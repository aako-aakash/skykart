"""
SKYKART — Payments Router

  POST /api/v1/payments/create-order        → init Razorpay order
  POST /api/v1/payments/verify              → verify + confirm payment
  GET  /api/v1/payments/order/{order_id}    → get payment status
  POST /api/v1/payments/webhook             → Razorpay webhook (raw body)
"""

import hmac
import hashlib
import json

from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.payments.service import PaymentService
from app.core.config import settings
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/payments", tags=["Payments"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreatePaymentOrderRequest(BaseModel):
    order_id: UUID


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/create-order")
def create_payment_order(
    data: CreatePaymentOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Step 1 of payment flow.
    Creates a Razorpay order and returns SDK initialisation payload.
    Frontend uses this to open the Razorpay checkout modal.
    """
    return PaymentService.create_razorpay_order(db, data.order_id, current_user.id)


@router.post("/verify")
def verify_payment(
    data: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Step 2 of payment flow.
    Called by the frontend after the user completes payment in Razorpay modal.
    We verify the HMAC signature server-side before confirming the order.
    """
    return PaymentService.verify_payment(
        db,
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    )


@router.get("/order/{order_id}")
def get_payment_status(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Poll payment status for a given order."""
    payment = PaymentService.get_payment_by_order(db, order_id, current_user.id)
    return {
        "status": payment.status,
        "amount": payment.amount,
        "paid_at": payment.paid_at,
        "gateway_payment_id": payment.gateway_payment_id,
    }


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_razorpay_signature: Optional[str] = Header(default=None),
):
    """
    Razorpay webhook endpoint.
    Razorpay sends events here for: payment.captured, payment.failed, refund.processed etc.

    IMPORTANT: This endpoint must be registered in your Razorpay dashboard.
    Verify the webhook signature using the webhook secret (different from API secret).
    """
    raw_body = await request.body()

    # Verify webhook signature
    if settings.RAZORPAY_WEBHOOK_SECRET and x_razorpay_signature:
        expected = hmac.new(
            key=settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            msg=raw_body,
            digestmod=hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, x_razorpay_signature):
            raise BadRequestException("Invalid webhook signature.")

    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        raise BadRequestException("Invalid webhook payload.")

    event_type = event.get("event")

    # Handle events — extend as needed
    if event_type == "payment.captured":
        payment_entity = event.get("payload", {}).get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")
        razorpay_payment_id = payment_entity.get("id")
        # In a real system, you'd auto-verify here as a fallback
        # if the frontend /verify call failed for any reason

    elif event_type == "payment.failed":
        # Log failure, notify user, etc.
        pass

    # Always return 200 to acknowledge receipt
    return {"status": "received"}
