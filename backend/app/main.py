"""
SKYKART — Main Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine
from app.models import Base
from app.middleware.logging import RequestLoggingMiddleware

from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.products.router import router as products_router
from app.cart.router import router as cart_router
from app.orders.router import router as orders_router
from app.payments.router import router as payments_router
from app.admin.router import router as admin_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("skykart")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting {settings.APP_NAME} [{settings.APP_ENV}]")
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created / verified.")
    yield
    logger.info(f"🛑 Shutting down {settings.APP_NAME}")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="SKYKART — Production-grade ecommerce API.",
        version="1.0.0",
        # Docs completely disabled in production — no /docs, no /redoc, no /openapi.json
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(RequestLoggingMiddleware)

    PREFIX = settings.API_V1_PREFIX
    app.include_router(auth_router,     prefix=PREFIX)
    app.include_router(users_router,    prefix=PREFIX)
    app.include_router(products_router, prefix=PREFIX)
    app.include_router(cart_router,     prefix=PREFIX)
    app.include_router(orders_router,   prefix=PREFIX)
    app.include_router(payments_router, prefix=PREFIX)
    app.include_router(admin_router,    prefix=PREFIX)

    # Health check — used by Render to verify service is alive
    @app.get("/health", include_in_schema=False)
    def health_check():
        return JSONResponse({"status": "ok", "app": settings.APP_NAME})

    # Root — clean minimal response, no mention of docs in production
    @app.get("/", include_in_schema=False)
    def root():
        if settings.is_production:
            return JSONResponse({
                "app": settings.APP_NAME,
                "status": "running",
                "version": "1.0.0",
            })
        return JSONResponse({
            "app": settings.APP_NAME,
            "status": "running",
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc",
        })

    return app


app = create_app()
