"""
SKYKART — Test Configuration
─────────────────────────────
Uses SQLite in-memory DB so tests run without PostgreSQL.
Each test gets a fresh DB + FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.session import get_db
from app.models.base import Base
from app.core.security import hash_password
from app.models.user import User, UserRole

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    user = User(
        email="test@example.com",
        full_name="Test User",
        password_hash=hash_password("Test@1234"),
        role=UserRole.USER,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    admin = User(
        email="admin@example.com",
        full_name="Test Admin",
        password_hash=hash_password("Admin@1234"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def user_token(client, test_user):
    res = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Test@1234",
    })
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client, test_admin):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin@1234",
    })
    return res.json()["access_token"]


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
