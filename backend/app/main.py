"""
SKYKART — Main Application Entry Point
────────────────────────────────────────
This is where everything comes together:
  - FastAPI app is created
  - All routers are registered under /api/v1
  - CORS is configured for the Next.js frontend
  - Request logging middleware is attached
  - Database tables are created on startup (dev mode)
  - Health check endpoint is exposed

Architecture note:
  All routes are prefixed with /api/v1 — this prefix is the contract
  with the frontend. When we later extract microservices, the gateway
  can route /api/v1/products/* to the products service transparently.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine
from app.models import Base  # Ensures all models are registered with SQLAlchemy
from app.middleware.logging import RequestLoggingMiddleware

# ── Module Routers ────────────────────────────────────────────────────────────
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.products.router import router as products_router
from app.cart.router import router as cart_router
from app.orders.router import router as orders_router
from app.payments.router import router as payments_router
from app.admin.router import router as admin_router

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("skykart")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup and shutdown.

    Startup:
      - Creates all DB tables if they don't exist (dev convenience).
      - In production, use Alembic migrations instead.

    Shutdown:
      - Clean up resources (e.g., close connection pools).
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} [{settings.APP_ENV}]")

    if settings.APP_ENV == "development":
        # Auto-create tables in development — use Alembic for staging/prod
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created / verified.")

    yield  # App runs here

    logger.info(f"🛑 Shutting down {settings.APP_NAME}")


# ── App Factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "SKYKART — Production-grade ecommerce API. "
            "Built with FastAPI, PostgreSQL, and SQLAlchemy."
        ),
        version="1.0.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Allows the Next.js frontend (localhost:3000 in dev) to call the API.
    # In production, set ALLOWED_ORIGINS to your actual domain.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Custom Middleware ──────────────────────────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    # ── Routers ───────────────────────────────────────────────────────────────
    # All routes live under /api/v1 — version prefix future-proofs the API.
    PREFIX = settings.API_V1_PREFIX

    app.include_router(auth_router,     prefix=PREFIX)
    app.include_router(users_router,    prefix=PREFIX)
    app.include_router(products_router, prefix=PREFIX)
    app.include_router(cart_router,     prefix=PREFIX)
    app.include_router(orders_router,   prefix=PREFIX)
    app.include_router(payments_router, prefix=PREFIX)
    app.include_router(admin_router,    prefix=PREFIX)

    # ── Health Check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"], include_in_schema=False)
    def health_check():
        """
        Simple liveness probe.
        Used by Render / Railway / Kubernetes to know the service is alive.
        """
        return JSONResponse({"status": "ok", "app": settings.APP_NAME})

    @app.get("/", tags=["Root"], include_in_schema=False)
    def root():
        return {
            "message": f"Welcome to {settings.APP_NAME} API",
            "docs": "/docs",
            "version": "1.0.0",
        }

    return app


# ── App Instance ──────────────────────────────────────────────────────────────
app = create_app()
