"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Sequence, Union

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create all enums safely using raw SQL — never fails if already exists
    conn.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                CREATE TYPE userrole AS ENUM ('user', 'admin');
            END IF;
        END $$;
    """))

    conn.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orderstatus') THEN
                CREATE TYPE orderstatus AS ENUM (
                    'pending', 'confirmed', 'processing',
                    'shipped', 'delivered', 'cancelled', 'refunded'
                );
            END IF;
        END $$;
    """))

    conn.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
                CREATE TYPE paymentstatus AS ENUM ('pending', 'success', 'failed', 'refunded');
            END IF;
        END $$;
    """))

    conn.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentmethod') THEN
                CREATE TYPE paymentmethod AS ENUM ('razorpay', 'stripe', 'wallet', 'cod');
            END IF;
        END $$;
    """))

    # Create all tables using pure SQL — fully idempotent
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL UNIQUE,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            role userrole NOT NULL DEFAULT 'user',
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_verified BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(120) NOT NULL UNIQUE,
            description TEXT,
            image_url VARCHAR(500),
            is_active BOOLEAN NOT NULL DEFAULT true,
            parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_categories_slug ON categories(slug);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(300) NOT NULL UNIQUE,
            description TEXT,
            short_description VARCHAR(500),
            price NUMERIC(10,2) NOT NULL,
            compare_price NUMERIC(10,2),
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            sku VARCHAR(100) UNIQUE,
            image_urls TEXT[] NOT NULL DEFAULT '{}',
            thumbnail_url VARCHAR(500),
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_featured BOOLEAN NOT NULL DEFAULT false,
            avg_rating FLOAT NOT NULL DEFAULT 0,
            review_count INTEGER NOT NULL DEFAULT 0,
            tags TEXT[] NOT NULL DEFAULT '{}',
            category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_products_slug ON products(slug);"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_products_name ON products(name);"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_products_category_id ON products(category_id);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS addresses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            line1 VARCHAR(255) NOT NULL,
            line2 VARCHAR(255),
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            pincode VARCHAR(10) NOT NULL,
            country VARCHAR(100) NOT NULL DEFAULT 'India',
            is_default BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_addresses_user_id ON addresses(user_id);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS cart_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_cart_items_user_id ON cart_items(user_id);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
            address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
            status orderstatus NOT NULL DEFAULT 'pending',
            subtotal NUMERIC(10,2) NOT NULL,
            discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
            total_amount NUMERIC(10,2) NOT NULL,
            coupon_code VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders(user_id);"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
            product_name VARCHAR(255) NOT NULL,
            product_image VARCHAR(500),
            quantity INTEGER NOT NULL,
            unit_price NUMERIC(10,2) NOT NULL,
            subtotal NUMERIC(10,2) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
            amount NUMERIC(10,2) NOT NULL,
            currency VARCHAR(10) NOT NULL DEFAULT 'INR',
            method paymentmethod NOT NULL DEFAULT 'razorpay',
            status paymentstatus NOT NULL DEFAULT 'pending',
            gateway_order_id VARCHAR(100),
            gateway_payment_id VARCHAR(100),
            gateway_signature VARCHAR(500),
            paid_at TIMESTAMPTZ,
            failure_reason VARCHAR(500),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments(order_id);"))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL,
            title VARCHAR(200),
            comment TEXT,
            is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_reviews_product_id ON reviews(product_id);"))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS reviews CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS payments CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS order_items CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS orders CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS cart_items CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS addresses CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS products CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS categories CASCADE;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE;"))
    conn.execute(sa.text("DROP TYPE IF EXISTS paymentmethod;"))
    conn.execute(sa.text("DROP TYPE IF EXISTS paymentstatus;"))
    conn.execute(sa.text("DROP TYPE IF EXISTS orderstatus;"))
    conn.execute(sa.text("DROP TYPE IF EXISTS userrole;"))
