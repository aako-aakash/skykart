"""
SKYKART — Shared Utilities
───────────────────────────
"""

import re
import unicodedata


# ── Slug Generator ────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """
    Convert a product/category name to a URL-safe slug.
    "Pro Wireless Headphones!" → "pro-wireless-headphones"
    """
    # Normalise unicode (e.g., é → e)
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    # Replace spaces and non-word chars with hyphens
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


# ── Pagination Meta ───────────────────────────────────────────────────────────

def pagination_meta(total: int, page: int, per_page: int) -> dict:
    """
    Compute pagination metadata dict.
    Used to build consistent paginated API responses.
    """
    import math
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total else 0,
        "has_next": page * per_page < total,
        "has_prev": page > 1,
    }
