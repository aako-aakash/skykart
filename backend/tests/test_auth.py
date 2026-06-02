"""Tests for authentication endpoints."""

import pytest
from tests.conftest import auth_header


def test_register_success(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "full_name": "New User",
        "password": "NewPass@123",
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "new@example.com"
    assert "password_hash" not in data
    assert data["role"] == "user"


def test_register_duplicate_email(client, test_user):
    res = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "full_name": "Duplicate",
        "password": "Dup@12345",
    })
    assert res.status_code == 409


def test_register_weak_password(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "weak@example.com",
        "full_name": "Weak User",
        "password": "password",   # no digits
    })
    assert res.status_code == 422


def test_login_success(client, test_user):
    res = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Test@1234",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_wrong_password(client, test_user):
    res = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "WrongPass@1",
    })
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "ghost@example.com",
        "password": "Ghost@1234",
    })
    assert res.status_code == 401


def test_get_me(client, user_token):
    res = client.get("/api/v1/auth/me", headers=auth_header(user_token))
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"


def test_get_me_no_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_change_password(client, user_token):
    res = client.post("/api/v1/auth/change-password",
        headers=auth_header(user_token),
        json={"current_password": "Test@1234", "new_password": "NewPass@999"},
    )
    assert res.status_code == 200


def test_change_password_wrong_current(client, user_token):
    res = client.post("/api/v1/auth/change-password",
        headers=auth_header(user_token),
        json={"current_password": "WrongCurrent", "new_password": "NewPass@999"},
    )
    assert res.status_code == 401
