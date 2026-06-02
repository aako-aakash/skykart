"""
SKYKART — Product & Category Schemas
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


# ── Category ──────────────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    parent_id: Optional[UUID] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Product ───────────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=300)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    compare_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: int = Field(default=0, ge=0)
    sku: Optional[str] = None
    image_urls: List[str] = []
    thumbnail_url: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    tags: List[str] = []
    category_id: Optional[UUID] = None


class ProductCreate(ProductBase):
    @field_validator("compare_price")
    @classmethod
    def compare_price_gt_price(cls, v, info):
        if v is not None and "price" in info.data and v <= info.data["price"]:
            raise ValueError("compare_price must be greater than price.")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    compare_price: Optional[Decimal] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_urls: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    category_id: Optional[UUID] = None


class ProductResponse(ProductBase):
    id: UUID
    avg_rating: float
    review_count: int
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Paginated product list."""
    items: List[ProductResponse]
    total: int
    page: int
    per_page: int
    pages: int
