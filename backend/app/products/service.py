"""
SKYKART — Products Service
───────────────────────────
Business logic for products and categories.

Handles:
  - Paginated product listing with search, filter, sort
  - Single product fetch by ID or slug
  - Category CRUD
  - Product CRUD (admin)
  - Stock decrement on order placement (called from orders service)
"""

import math
from typing import Optional, List
from uuid import UUID
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc

from app.models.product import Product, Category
from app.schemas.product import (
    ProductCreate, ProductUpdate,
    CategoryCreate, CategoryUpdate,
    ProductListResponse,
)
from app.core.exceptions import NotFoundException, ConflictException, BadRequestException


# ── Category Service ──────────────────────────────────────────────────────────

class CategoryService:

    @staticmethod
    def get_all(db: Session, active_only: bool = True) -> List[Category]:
        q = db.query(Category)
        if active_only:
            q = q.filter(Category.is_active == True)
        return q.order_by(Category.name).all()

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> Category:
        cat = db.query(Category).filter(Category.slug == slug).first()
        if not cat:
            raise NotFoundException(f"Category '{slug}' not found.")
        return cat

    @staticmethod
    def create(db: Session, data: CategoryCreate) -> Category:
        if db.query(Category).filter(Category.slug == data.slug).first():
            raise ConflictException(f"Category slug '{data.slug}' already exists.")
        cat = Category(**data.model_dump())
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return cat

    @staticmethod
    def update(db: Session, category_id: UUID, data: CategoryUpdate) -> Category:
        cat = db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            raise NotFoundException("Category not found.")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(cat, field, value)
        db.commit()
        db.refresh(cat)
        return cat

    @staticmethod
    def delete(db: Session, category_id: UUID) -> None:
        cat = db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            raise NotFoundException("Category not found.")
        db.delete(cat)
        db.commit()


# ── Product Service ───────────────────────────────────────────────────────────

class ProductService:

    @staticmethod
    def list_products(
        db: Session,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        category_id: Optional[UUID] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        is_featured: Optional[bool] = None,
        sort_by: str = "created_at",        # created_at | price | avg_rating | name
        sort_order: str = "desc",           # asc | desc
        active_only: bool = True,
    ) -> ProductListResponse:
        """
        Flexible product listing with:
          - Full-text style search on name + description
          - Category filter
          - Price range filter
          - Featured flag filter
          - Configurable sort
          - Pagination
        """
        q = db.query(Product)

        if active_only:
            q = q.filter(Product.is_active == True)

        # Search — ilike for case-insensitive partial match
        if search:
            term = f"%{search.strip()}%"
            q = q.filter(
                or_(
                    Product.name.ilike(term),
                    Product.description.ilike(term),
                    Product.short_description.ilike(term),
                )
            )

        if category_id:
            q = q.filter(Product.category_id == category_id)

        if min_price is not None:
            q = q.filter(Product.price >= min_price)

        if max_price is not None:
            q = q.filter(Product.price <= max_price)

        if is_featured is not None:
            q = q.filter(Product.is_featured == is_featured)

        # Sorting
        sort_column_map = {
            "created_at": Product.created_at,
            "price": Product.price,
            "avg_rating": Product.avg_rating,
            "name": Product.name,
        }
        sort_col = sort_column_map.get(sort_by, Product.created_at)
        order_fn = desc if sort_order == "desc" else asc
        q = q.order_by(order_fn(sort_col))

        total = q.count()
        offset = (page - 1) * per_page
        items = q.offset(offset).limit(per_page).all()

        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total else 0,
        )

    @staticmethod
    def get_by_id(db: Session, product_id: UUID) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException("Product not found.")
        return product

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> Product:
        product = db.query(Product).filter(Product.slug == slug).first()
        if not product:
            raise NotFoundException(f"Product '{slug}' not found.")
        return product

    @staticmethod
    def create(db: Session, data: ProductCreate) -> Product:
        if db.query(Product).filter(Product.slug == data.slug).first():
            raise ConflictException(f"Product slug '{data.slug}' already exists.")
        if data.sku and db.query(Product).filter(Product.sku == data.sku).first():
            raise ConflictException(f"SKU '{data.sku}' already exists.")

        product = Product(**data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product_id: UUID, data: ProductUpdate) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException("Product not found.")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(product, field, value)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product_id: UUID) -> None:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException("Product not found.")
        # Soft delete — just deactivate
        product.is_active = False
        db.commit()

    @staticmethod
    def decrement_stock(db: Session, product_id: UUID, quantity: int) -> None:
        """Called during order placement to reduce stock."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException("Product not found.")
        if product.stock_quantity < quantity:
            raise BadRequestException(
                f"Insufficient stock for '{product.name}'. "
                f"Available: {product.stock_quantity}, requested: {quantity}."
            )
        product.stock_quantity -= quantity
        db.commit()
