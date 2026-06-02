"""
SKYKART — Database Seeder
──────────────────────────
Populates the database with realistic sample data for development.

Run with:
  cd backend
  python -m app.database.seed

Creates:
  - 1 admin user
  - 3 regular users
  - 6 categories
  - 20 sample products across categories
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from decimal import Decimal
from app.database.session import SessionLocal, engine
from app.models import Base
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)


CATEGORIES = [
    {"name": "Electronics",   "slug": "electronics",   "description": "Gadgets and devices"},
    {"name": "Fashion",       "slug": "fashion",       "description": "Clothing and accessories"},
    {"name": "Home & Living", "slug": "home-living",   "description": "Furniture and decor"},
    {"name": "Sports",        "slug": "sports",        "description": "Fitness and outdoor gear"},
    {"name": "Beauty",        "slug": "beauty",        "description": "Skincare and cosmetics"},
    {"name": "Books",         "slug": "books",         "description": "Books and stationery"},
]

PRODUCTS = [
    # Electronics
    dict(name="Pro Wireless Headphones X1", slug="pro-wireless-headphones-x1",
         short_description="Premium noise-cancelling Bluetooth headphones",
         price=Decimal("4299.00"), compare_price=Decimal("6999.00"),
         stock_quantity=50, is_featured=True, avg_rating=4.8, review_count=234,
         tags=["wireless", "bluetooth", "noise-cancelling"], category_slug="electronics",
         thumbnail_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"),

    dict(name="Smart Fitness Watch Pro", slug="smart-fitness-watch-pro",
         short_description="Health tracking with 7-day battery life",
         price=Decimal("7499.00"), compare_price=None,
         stock_quantity=30, is_featured=True, avg_rating=4.9, review_count=189,
         tags=["smartwatch", "fitness", "health"], category_slug="electronics",
         thumbnail_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"),

    dict(name="Slim Laptop Stand Aluminium", slug="slim-laptop-stand-aluminium",
         short_description="Ergonomic adjustable desk stand for laptops",
         price=Decimal("1599.00"), compare_price=Decimal("2199.00"),
         stock_quantity=120, is_featured=False, avg_rating=4.3, review_count=98,
         tags=["laptop", "ergonomic", "desk"], category_slug="electronics",
         thumbnail_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"),

    dict(name="4K Webcam Ultra HD", slug="4k-webcam-ultra-hd",
         short_description="Crystal clear 4K video calling webcam",
         price=Decimal("5999.00"), compare_price=Decimal("7500.00"),
         stock_quantity=45, is_featured=True, avg_rating=4.6, review_count=67,
         tags=["webcam", "4k", "video-call"], category_slug="electronics",
         thumbnail_url="https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400"),

    # Fashion
    dict(name="Urban Backpack Pro 30L", slug="urban-backpack-pro-30l",
         short_description="Waterproof travel backpack with USB charging port",
         price=Decimal("3199.00"), compare_price=None,
         stock_quantity=80, is_featured=True, avg_rating=4.7, review_count=312,
         tags=["backpack", "travel", "waterproof"], category_slug="fashion",
         thumbnail_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"),

    dict(name="Merino Wool Crew Neck Sweater", slug="merino-wool-crew-neck-sweater",
         short_description="Premium 100% Merino wool in classic fit",
         price=Decimal("2899.00"), compare_price=Decimal("3999.00"),
         stock_quantity=60, is_featured=False, avg_rating=4.5, review_count=145,
         tags=["sweater", "merino", "wool"], category_slug="fashion",
         thumbnail_url="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"),

    dict(name="Minimalist Leather Wallet", slug="minimalist-leather-wallet",
         short_description="Slim RFID-blocking genuine leather wallet",
         price=Decimal("899.00"), compare_price=Decimal("1299.00"),
         stock_quantity=200, is_featured=False, avg_rating=4.4, review_count=221,
         tags=["wallet", "leather", "rfid"], category_slug="fashion",
         thumbnail_url="https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"),

    # Home & Living
    dict(name="Luxury Soy Candle Set (3pc)", slug="luxury-soy-candle-set-3pc",
         short_description="Hand-poured soy wax candles — Lavender, Vanilla, Cedar",
         price=Decimal("899.00"), compare_price=Decimal("1299.00"),
         stock_quantity=150, is_featured=True, avg_rating=4.6, review_count=88,
         tags=["candle", "home-decor", "gift"], category_slug="home-living",
         thumbnail_url="https://images.unsplash.com/photo-1602607817160-5e56fce5c0b8?w=400"),

    dict(name="Bamboo Cutting Board Set", slug="bamboo-cutting-board-set",
         short_description="Eco-friendly bamboo boards in 3 sizes",
         price=Decimal("1249.00"), compare_price=None,
         stock_quantity=75, is_featured=False, avg_rating=4.2, review_count=54,
         tags=["kitchen", "bamboo", "eco"], category_slug="home-living",
         thumbnail_url="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"),

    # Sports
    dict(name="Air Comfort Running Shoes", slug="air-comfort-running-shoes",
         short_description="Lightweight responsive foam for all-day running",
         price=Decimal("2899.00"), compare_price=Decimal("4500.00"),
         stock_quantity=90, is_featured=True, avg_rating=4.5, review_count=178,
         tags=["running", "shoes", "sports"], category_slug="sports",
         thumbnail_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"),

    dict(name="Resistance Bands Set (5 levels)", slug="resistance-bands-set-5-levels",
         short_description="Professional latex resistance bands for home gym",
         price=Decimal("699.00"), compare_price=Decimal("999.00"),
         stock_quantity=300, is_featured=False, avg_rating=4.7, review_count=267,
         tags=["gym", "resistance", "workout"], category_slug="sports",
         thumbnail_url="https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400"),

    dict(name="Yoga Mat Premium 6mm", slug="yoga-mat-premium-6mm",
         short_description="Non-slip TPE yoga mat with alignment lines",
         price=Decimal("1499.00"), compare_price=None,
         stock_quantity=110, is_featured=False, avg_rating=4.6, review_count=134,
         tags=["yoga", "mat", "fitness"], category_slug="sports",
         thumbnail_url="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400"),

    # Beauty
    dict(name="Vitamin C Brightening Serum", slug="vitamin-c-brightening-serum",
         short_description="20% Vitamin C serum for radiant, even skin tone",
         price=Decimal("1199.00"), compare_price=Decimal("1799.00"),
         stock_quantity=85, is_featured=True, avg_rating=4.8, review_count=421,
         tags=["serum", "vitamin-c", "skincare"], category_slug="beauty",
         thumbnail_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"),

    dict(name="Hyaluronic Acid Moisturiser", slug="hyaluronic-acid-moisturiser",
         short_description="Deep hydration formula with 3 types of hyaluronic acid",
         price=Decimal("899.00"), compare_price=None,
         stock_quantity=140, is_featured=False, avg_rating=4.7, review_count=298,
         tags=["moisturiser", "hydration", "skincare"], category_slug="beauty",
         thumbnail_url="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"),

    # Books
    dict(name="Clean Code — Robert C. Martin", slug="clean-code-robert-martin",
         short_description="A handbook of agile software craftsmanship",
         price=Decimal("649.00"), compare_price=Decimal("899.00"),
         stock_quantity=500, is_featured=False, avg_rating=4.9, review_count=1204,
         tags=["programming", "software", "engineering"], category_slug="books",
         thumbnail_url="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"),

    dict(name="System Design Interview Vol. 2", slug="system-design-interview-vol-2",
         short_description="An insider's guide to large-scale system design",
         price=Decimal("799.00"), compare_price=None,
         stock_quantity=350, is_featured=True, avg_rating=4.8, review_count=867,
         tags=["system-design", "interview", "engineering"], category_slug="books",
         thumbnail_url="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"),
]


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("⚠️  Database already seeded. Skipping.")
            return

        print("🌱 Seeding database...")

        # ── Users ──────────────────────────────────────────────────────────
        admin = User(
            email="admin@skykart.com",
            full_name="Sky Admin",
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        user1 = User(
            email="alice@example.com",
            full_name="Alice Johnson",
            phone="9876543210",
            password_hash=hash_password("Alice@123"),
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        user2 = User(
            email="bob@example.com",
            full_name="Bob Smith",
            password_hash=hash_password("Bob@1234"),
            role=UserRole.USER,
            is_active=True,
        )
        db.add_all([admin, user1, user2])
        db.flush()
        print(f"  ✅ Created {3} users")

        # ── Categories ────────────────────────────────────────────────────
        cat_map = {}
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            cat_map[cat_data["slug"]] = cat
        print(f"  ✅ Created {len(CATEGORIES)} categories")

        # ── Products ──────────────────────────────────────────────────────
        for p_data in PRODUCTS:
            cat_slug = p_data.pop("category_slug")
            product = Product(
                **p_data,
                category_id=cat_map[cat_slug].id,
                image_urls=[p_data.get("thumbnail_url", "")],
            )
            db.add(product)

        db.commit()
        print(f"  ✅ Created {len(PRODUCTS)} products")
        print("\n🎉 Seed complete!")
        print("\n  Admin credentials:")
        print("    Email:    admin@skykart.com")
        print("    Password: Admin@123")
        print("\n  Test user:")
        print("    Email:    alice@example.com")
        print("    Password: Alice@123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
