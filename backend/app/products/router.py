"""
SKYKART — Products Router
──────────────────────────
Public endpoints (no auth needed):
  GET  /api/v1/products              → paginated list with filters
  GET  /api/v1/products/{slug}       → single product by slug
  GET  /api/v1/categories            → all active categories
  GET  /api/v1/categories/{slug}     → single category

Admin-only endpoints:
  POST   /api/v1/products            → create product
  PATCH  /api/v1/products/{id}       → update product
  DELETE /api/v1/products/{id}       → soft-delete product
  POST   /api/v1/categories          → create category
  PATCH  /api/v1/categories/{id}     → update category
  DELETE /api/v1/categories/{id}     → delete category
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from decimal import Decimal

from app.database.session import get_db
from app.auth.dependencies import get_current_active_user, require_admin
from app.models.user import User
from app.products.service import ProductService, CategoryService
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
)

router = APIRouter(tags=["Products"])


# ── Categories (public) ───────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return CategoryService.get_all(db)


@router.get("/categories/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    return CategoryService.get_by_slug(db, slug)


# ── Categories (admin) ────────────────────────────────────────────────────────

@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService.create(db, data)


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    dependencies=[Depends(require_admin)],
)
def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
):
    return CategoryService.update(db, category_id, data)


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_category(category_id: UUID, db: Session = Depends(get_db)):
    CategoryService.delete(db, category_id)


# ── Products (public) ─────────────────────────────────────────────────────────

@router.get("/products", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None, max_length=200),
    category_id: Optional[UUID] = Query(default=None),
    min_price: Optional[Decimal] = Query(default=None, ge=0),
    max_price: Optional[Decimal] = Query(default=None, ge=0),
    is_featured: Optional[bool] = Query(default=None),
    sort_by: str = Query(default="created_at", pattern="^(created_at|price|avg_rating|name)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
):
    return ProductService.list_products(
        db=db,
        page=page,
        per_page=per_page,
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/products/featured", response_model=List[ProductResponse])
def featured_products(
    limit: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Quick endpoint for homepage featured products section."""
    result = ProductService.list_products(
        db=db, page=1, per_page=limit, is_featured=True
    )
    return result.items


@router.get("/products/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    return ProductService.get_by_slug(db, slug)


# ── Products (admin) ──────────────────────────────────────────────────────────

@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return ProductService.create(db, data)


@router.patch(
    "/products/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_admin)],
)
def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    return ProductService.update(db, product_id, data)


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: UUID, db: Session = Depends(get_db)):
    ProductService.delete(db, product_id)
