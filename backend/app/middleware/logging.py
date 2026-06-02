"""
SKYKART — Request Logging Middleware
──────────────────────────────────────
Logs every incoming request with:
  - HTTP method + path
  - Response status code
  - Request duration in ms
  - Client IP

In production, plug this into a structured logging system (e.g., Datadog,
Logfire, or ship logs to CloudWatch).
"""

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("skykart.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        client_ip = request.client.host if request.client else "unknown"

        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} "
            f"[{duration_ms:.1f}ms] "
            f"from {client_ip}"
        )

        # Attach timing header — useful for frontend performance debugging
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.1f}"
        return response
