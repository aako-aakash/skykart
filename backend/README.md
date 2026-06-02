# SKYKART Backend

Production-grade FastAPI + PostgreSQL ecommerce API.

---

## Tech Stack

- **Framework:** FastAPI 0.111
- **Database:** PostgreSQL + SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT (python-jose) + bcrypt (passlib)
- **Validation:** Pydantic v2
- **Payments:** Razorpay

---

## Quick Start

### 1. Clone and enter the backend directory

```bash
cd skykart/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your values:
#   DATABASE_URL=postgresql://user:password@localhost:5432/skykart_db
#   SECRET_KEY=your-random-secret-key-min-32-chars
```

### 5. Create the PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE skykart_db;
CREATE USER skykart_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE skykart_db TO skykart_user;
\q
```

### 6. Run migrations

```bash
make migrate
# or: alembic upgrade head
```

### 7. Seed the database

```bash
make seed
# Creates admin user, categories, and sample products
```

### 8. Start the development server

```bash
make dev
# or: uvicorn app.main:app --reload --port 8000
```

### 9. Open API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

---

## API Overview

| Module    | Prefix               | Auth Required |
|-----------|----------------------|---------------|
| Auth      | /api/v1/auth         | No (login/register) |
| Users     | /api/v1/users        | Yes           |
| Products  | /api/v1/products     | No (read) / Admin (write) |
| Categories| /api/v1/categories   | No (read) / Admin (write) |
| Cart      | /api/v1/cart         | Yes           |
| Orders    | /api/v1/orders       | Yes           |
| Payments  | /api/v1/payments     | Yes           |
| Admin     | /api/v1/admin        | Admin only    |

---

## Key Endpoints

### Auth
```
POST /api/v1/auth/register          Register new user
POST /api/v1/auth/login             Login → JWT tokens
POST /api/v1/auth/refresh           Refresh access token
GET  /api/v1/auth/me                Get current user
POST /api/v1/auth/change-password   Change password
```

### Products
```
GET  /api/v1/products               List products (search, filter, sort, paginate)
GET  /api/v1/products/{slug}        Get product detail
GET  /api/v1/products/featured      Featured products for homepage
POST /api/v1/products               Create product (admin)
```

### Cart
```
GET    /api/v1/cart                 Get cart
POST   /api/v1/cart/items           Add item
PATCH  /api/v1/cart/items/{id}      Update quantity
DELETE /api/v1/cart/items/{id}      Remove item
```

### Orders
```
POST /api/v1/orders                 Checkout → place order
GET  /api/v1/orders                 My orders
GET  /api/v1/orders/{id}            Order detail
POST /api/v1/orders/{id}/cancel     Cancel order
```

### Payments
```
POST /api/v1/payments/create-order  Init Razorpay order
POST /api/v1/payments/verify        Verify payment signature
POST /api/v1/payments/webhook       Razorpay webhook
```

### Admin
```
GET   /api/v1/admin/stats           Dashboard metrics
GET   /api/v1/admin/users           All users
GET   /api/v1/admin/orders          All orders
PATCH /api/v1/admin/orders/{id}/status   Update order status
```

---

## Folder Structure

```
backend/
├── app/
│   ├── auth/           JWT deps, router, service
│   ├── users/          Profile, addresses
│   ├── products/       Products, categories
│   ├── cart/           Cart management
│   ├── orders/         Checkout, order lifecycle
│   ├── payments/       Razorpay integration
│   ├── admin/          Dashboard, user management
│   ├── core/           Config, security, exceptions
│   ├── database/       Session, seed script
│   ├── models/         SQLAlchemy models
│   ├── schemas/        Pydantic schemas
│   ├── middleware/      Request logging
│   ├── utils/          Helpers (slugify, pagination)
│   └── main.py         App factory + router registration
├── alembic/            Database migrations
├── requirements.txt
├── Makefile
└── .env.example
```

---

## Seed Credentials

After running `make seed`:

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@skykart.com      | Admin@123  |
| User  | alice@example.com      | Alice@123  |
| User  | bob@example.com        | Bob@1234   |

---

## Deployment (Render)

1. Push backend to GitHub
2. Create a new **Web Service** on Render
3. Set build command: `pip install -r requirements.txt && alembic upgrade head`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Attach a PostgreSQL database — Render provides DATABASE_URL automatically

---

## Next Phase

Phase 4 → Next.js frontend with full API integration.
