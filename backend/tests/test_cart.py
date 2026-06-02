"""Tests for cart endpoints."""

import pytest
from decimal import Decimal
from tests.conftest import auth_header
from app.models.product import Product, Category


def seed_product(db, slug="prod-1", stock=50):
    p = Product(name="Product", slug=slug, price=Decimal("500.00"), stock_quantity=stock, is_active=True)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def test_get_cart_empty(client, user_token):
    res = client.get("/api/v1/cart", headers=auth_header(user_token))
    assert res.status_code == 200
    assert res.json()["items"] == []
    assert res.json()["item_count"] == 0


def test_add_item_to_cart(client, user_token, db):
    p = seed_product(db)
    res = client.post("/api/v1/cart/items",
        headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 2},
    )
    assert res.status_code == 200
    assert res.json()["item_count"] == 1
    assert res.json()["items"][0]["quantity"] == 2


def test_add_item_increments_existing(client, user_token, db):
    p = seed_product(db)
    client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 1})
    res = client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 2})
    assert res.status_code == 200
    assert res.json()["items"][0]["quantity"] == 3


def test_add_item_exceeds_stock(client, user_token, db):
    p = seed_product(db, stock=3)
    res = client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 10})
    assert res.status_code == 400


def test_update_cart_item(client, user_token, db):
    p = seed_product(db)
    add_res = client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 1})
    item_id = add_res.json()["items"][0]["id"]
    res = client.patch(f"/api/v1/cart/items/{item_id}",
        headers=auth_header(user_token), json={"quantity": 5})
    assert res.status_code == 200
    assert res.json()["items"][0]["quantity"] == 5


def test_remove_cart_item(client, user_token, db):
    p = seed_product(db)
    add_res = client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 1})
    item_id = add_res.json()["items"][0]["id"]
    res = client.delete(f"/api/v1/cart/items/{item_id}", headers=auth_header(user_token))
    assert res.status_code == 200
    assert res.json()["item_count"] == 0


def test_clear_cart(client, user_token, db):
    p = seed_product(db)
    client.post("/api/v1/cart/items", headers=auth_header(user_token),
        json={"product_id": str(p.id), "quantity": 1})
    res = client.delete("/api/v1/cart", headers=auth_header(user_token))
    assert res.status_code == 204


def test_cart_requires_auth(client):
    res = client.get("/api/v1/cart")
    assert res.status_code == 401
