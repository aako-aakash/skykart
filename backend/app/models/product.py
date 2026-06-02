"""
SKYKART — Product & Category Models
──────────────────────────────────────
Two models:
  - Category: hierarchical (parent_id self-referential FK for subcategories)
  - Product:  belongs to a category; tracks price, stock, images, ratings

Design decisions:
  - image_urls stored as PostgreSQL ARRAY of text — avoids a join table for
    simple image lists. For complex media management, consider a media table.
  - compare_price enables "was ₹999 now ₹699" UI without extra logic
  - avg_rating is a denormalized cache — recomputed when reviews are added
    (avoids expensive AVG() on every product listing query)
  - slug: URL-friendly identifier (e.g., "noise-cancelling-headphones-pro")
    Indexed for fast /products/{slug} lookups
"""

import enum
from sqlalchemy import (
    Column, String, Text, Numeric, Integer, Boolean,
    ForeignKey, Float, ARRAY,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class Category(Base, UUIDMixin, TimestampMixin):
    """
    Product categories with optional parent (for subcategories).

    Example hierarchy:
      Electronics  (parent_id=None)
        └─ Headphones  (parent_id=electronics.id)
        └─ Laptops     (parent_id=electronics.id)
    """

    __tablename__ = "categories"

    name = Column(String(100), nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Self-referential FK for nested categories
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category slug={self.slug}>"


class Product(Base, UUIDMixin, TimestampMixin):
    """
    Core product listing.

    Relationships:
      - Belongs to one Category
      - Has many CartItems
      - Has many OrderItems
      - Has many Reviews
    """

    __tablename__ = "products"

    # ── Core Info ─────────────────────────────────────────────────────────────
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(300), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)

    # ── Pricing ───────────────────────────────────────────────────────────────
    # Numeric(10, 2) = up to 99,999,999.99 — covers any realistic product price
    price = Column(Numeric(10, 2), nullable=False)
    compare_price = Column(Numeric(10, 2), nullable=True)  # "Was" price for sale UI

    # ── Inventory ─────────────────────────────────────────────────────────────
    stock_quantity = Column(Integer, default=0, nullable=False)
    sku = Column(String(100), unique=True, nullable=True)

    # ── Media ─────────────────────────────────────────────────────────────────
    # PostgreSQL ARRAY stores multiple image URLs in a single column
    image_urls = Column(ARRAY(String), default=list, nullable=False, server_default="{}")
    thumbnail_url = Column(String(500), nullable=True)

    # ── Metadata ──────────────────────────────────────────────────────────────
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    avg_rating = Column(Float, default=0.0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)

    # Tags stored as ARRAY (e.g., ["wireless", "bluetooth", "noise-cancelling"])
    tags = Column(ARRAY(String), default=list, nullable=False, server_default="{}")

    # ── Foreign Keys ──────────────────────────────────────────────────────────
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Product slug={self.slug} price={self.price}>"
