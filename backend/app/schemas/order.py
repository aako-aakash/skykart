"""
SKYKART — Order & Address Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from app.models.order import OrderStatus


# ── Address ───────────────────────────────────────────────────────────────────

class AddressCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., max_length=20)
    line1: str = Field(..., min_length=5, max_length=255)
    line2: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=4, max_length=10)
    country: str = "India"
    is_default: bool = False


class AddressResponse(AddressCreate):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Order ─────────────────────────────────────────────────────────────────────

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_image: Optional[str]
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class CheckoutRequest(BaseModel):
    address_id: UUID
    coupon_code: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: OrderStatus
    subtotal: Decimal
    discount_amount: Decimal
    shipping_charge: Decimal
    total_amount: Decimal
    coupon_code: Optional[str]
    notes: Optional[str]
    items: List[OrderItemResponse]
    address: AddressResponse
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    per_page: int
    pages: int


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
