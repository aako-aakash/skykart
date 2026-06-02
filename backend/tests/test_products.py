"""Tests for products and categories endpoints."""

import pytest
from tests.conftest import auth_header
from app.models.product import Category, Product
from decimal import Decimal


def seed_category(db):
    cat = Category(name="Electronics", slug="electronics")
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def seed_product(db, category_id=None):
    p = Product(
        name="Test Headphones",
        slug="test-headphones",
        price=Decimal("999.00"),
        stock_quantity=50,
        is_active=True,
        category_id=category_id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


# ── Categories ────────────────────────────────────────────────────────────────

def test_list_categories_empty(client):
    res = client.get("/api/v1/categories")
    assert res.status_code == 200
    assert res.json() == []


def test_list_categories(client, db):
    seed_category(db)
    res = client.get("/api/v1/categories")
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_create_category_admin_only(client, user_token):
    res = client.post("/api/v1/categories",
        headers=auth_header(user_token),
        json={"name": "Sports", "slug": "sports"},
    )
    assert res.status_code == 403


def test_create_category_admin(client, admin_token):
    res = client.post("/api/v1/categories",
        headers=auth_header(admin_token),
        json={"name": "Sports", "slug": "sports"},
    )
    assert res.status_code == 201
    assert res.json()["slug"] == "sports"


# ── Products ──────────────────────────────────────────────────────────────────

def test_list_products_empty(client):
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    assert res.json()["total"] == 0
    assert res.json()["items"] == []


def test_list_products(client, db):
    seed_product(db)
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    assert res.json()["total"] == 1


def test_list_products_search(client, db):
    seed_product(db)
    res = client.get("/api/v1/products?search=Headphones")
    assert res.status_code == 200
    assert res.json()["total"] == 1

    res2 = client.get("/api/v1/products?search=NonExistent")
    assert res2.json()["total"] == 0


def test_get_product_by_slug(client, db):
    seed_product(db)
    res = client.get("/api/v1/products/test-headphones")
    assert res.status_code == 200
    assert res.json()["name"] == "Test Headphones"


def test_get_product_not_found(client):
    res = client.get("/api/v1/products/does-not-exist")
    assert res.status_code == 404


def test_create_product_admin(client, admin_token, db):
    cat = seed_category(db)
    res = client.post("/api/v1/products",
        headers=auth_header(admin_token),
        json={
            "name": "New Product",
            "slug": "new-product",
            "price": "1299.00",
            "stock_quantity": 100,
            "category_id": str(cat.id),
        },
    )
    assert res.status_code == 201
    assert res.json()["slug"] == "new-product"


def test_create_product_requires_admin(client, user_token):
    res = client.post("/api/v1/products",
        headers=auth_header(user_token),
        json={"name": "X", "slug": "x", "price": "100"},
    )
    assert res.status_code == 403


def test_delete_product_soft(client, admin_token, db):
    p = seed_product(db)
    res = client.delete(f"/api/v1/products/{p.id}", headers=auth_header(admin_token))
    assert res.status_code == 204
    # Should be deactivated, not gone
    db.refresh(p)
    assert p.is_active is False
