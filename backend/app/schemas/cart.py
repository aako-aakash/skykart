"""
SKYKART — Cart Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from app.schemas.product import ProductResponse


class CartItemAdd(BaseModel):
    product_id: UUID
    quantity: int = Field(default=1, ge=1, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=100)


class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    product: ProductResponse
    subtotal: Decimal   # Computed field: product.price × quantity

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    item_count: int
    total_amount: Decimal
