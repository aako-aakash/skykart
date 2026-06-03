<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6C63FF&height=200&section=header&text=SKYKART&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Shop%20the%20Future%2C%20Delivered%20Today&descAlignY=60&descAlign=50" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

<br/>

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-6C63FF?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

> **SKYKART** is a production-grade, full-stack ecommerce ecosystem built with modern engineering practices.
> Clean architecture · Scalable design · Real-world security · Full deployment pipeline.

<br/>

[**Live Demo**](https://skykart.vercel.app) · [**API Docs**](https://skykart-api.onrender.com/docs) · [**Report Bug**](issues) · [**Request Feature**](issues)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛍️ Storefront
- Beautiful dark-mode UI with smooth animations
- Product search with real-time filters & sorting
- Category browsing with 6 departments
- Product detail pages with image gallery
- Responsive — works on all screen sizes

</td>
<td width="50%">

### 🔐 Authentication
- JWT access + refresh token system
- Silent token refresh (never logged out)
- bcrypt password hashing
- Role-based access control (User / Admin)
- Protected routes on frontend + backend

</td>
</tr>
<tr>
<td width="50%">

### 🛒 Cart & Orders
- Persistent cart synced to database
- Real-time stock validation
- Atomic checkout — ACID-compliant transaction
- Full order lifecycle tracking
- Order cancellation with stock restore

</td>
<td width="50%">

### 💳 Payments
- Razorpay integration (UPI, Cards, Wallets)
- HMAC-SHA256 signature verification
- Webhook handling for payment events
- Automatic order confirmation on payment
- Secure — card data never touches our servers

</td>
</tr>
<tr>
<td width="50%">

### 📊 Admin Dashboard
- Real-time stats (revenue, orders, users)
- Full product CRUD with image management
- Order management with status updates
- User management with role controls
- Paginated tables with search & filter

</td>
<td width="50%">

### 🚀 Production Ready
- Docker Compose for local development
- GitHub Actions CI/CD pipeline
- Vercel (frontend) + Render (backend)
- Alembic database migrations
- 30+ pytest tests with coverage

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SKYKART                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Next.js 14 Frontend                    │   │
│   │   App Router · TypeScript · Tailwind · Zustand      │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │ REST API (HTTPS)                  │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │               FastAPI Backend                       │   │
│   │  ┌────────┐ ┌──────────┐ ┌───────┐ ┌───────────┐   │   │
│   │  │  Auth  │ │ Products │ │ Cart  │ │  Orders   │   │   │
│   │  └────────┘ └──────────┘ └───────┘ └───────────┘   │   │
│   │  ┌──────────────┐ ┌──────────┐ ┌───────────────┐   │   │
│   │  │   Payments   │ │  Admin   │ │     Users     │   │   │
│   │  └──────────────┘ └──────────┘ └───────────────┘   │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │ SQLAlchemy ORM                    │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │              PostgreSQL Database                    │   │
│   │   users · products · categories · cart_items        │   │
│   │   orders · order_items · payments · reviews          │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   External: Razorpay · Cloudinary · Resend                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, performance |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Language** | TypeScript | Type safety across the frontend |
| **State** | Zustand | Auth & cart global state |
| **Server State** | TanStack React Query | API caching & synchronization |
| **Forms** | React Hook Form + Zod | Validated forms with schema inference |
| **Backend** | FastAPI (Python 3.11) | High-performance async REST API |
| **ORM** | SQLAlchemy 2.0 | Database models & queries |
| **Validation** | Pydantic v2 | Request/response schema validation |
| **Database** | PostgreSQL 15 | Primary relational database |
| **Migrations** | Alembic | Version-controlled schema changes |
| **Auth** | JWT + bcrypt | Stateless auth with secure hashing |
| **Payments** | Razorpay | Indian payment gateway |
| **Containers** | Docker + Compose | Reproducible dev environment |
| **CI/CD** | GitHub Actions | Automated test & deploy pipeline |
| **Hosting (FE)** | Vercel | Frontend deployment & CDN |
| **Hosting (BE)** | Render | Backend + managed PostgreSQL |

---

## 📁 Project Structure

```
skykart/
│
├── 📂 frontend/                    # Next.js 14 Application
│   ├── app/
│   │   ├── (auth)/                 # Login & Register pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (shop)/                 # Customer-facing pages
│   │   │   ├── page.tsx            # Homepage
│   │   │   ├── products/           # Product listing + detail
│   │   │   ├── cart/               # Shopping cart
│   │   │   ├── checkout/           # Checkout + Razorpay
│   │   │   ├── orders/             # Order history + detail
│   │   │   └── account/            # User profile
│   │   └── admin/                  # Admin dashboard
│   │       ├── page.tsx            # Stats overview
│   │       ├── products/           # Product management
│   │       ├── orders/             # Order management
│   │       └── users/              # User management
│   ├── components/
│   │   ├── ui/                     # Button, Input, Badge, Modal...
│   │   ├── layout/                 # Navbar, Footer
│   │   ├── home/                   # Hero, Categories, Featured
│   │   ├── product/                # ProductCard, ProductGrid
│   │   ├── cart/                   # CartDrawer
│   │   └── common/                 # QueryProvider, ProtectedRoute
│   ├── services/                   # Axios API client + service functions
│   ├── store/                      # Zustand stores (auth, cart)
│   ├── hooks/                      # useAuth, useCart, useProducts
│   ├── types/                      # TypeScript interfaces
│   └── utils/                      # formatPrice, cn, ORDER_STATUS_MAP
│
├── 📂 backend/                     # FastAPI Application
│   ├── app/
│   │   ├── auth/                   # JWT auth, dependencies, router
│   │   ├── users/                  # Profile, addresses
│   │   ├── products/               # Products, categories, search
│   │   ├── cart/                   # Cart management
│   │   ├── orders/                 # Checkout, order lifecycle
│   │   ├── payments/               # Razorpay integration
│   │   ├── admin/                  # Dashboard stats & management
│   │   ├── core/                   # Config, security, exceptions
│   │   ├── database/               # Session, seeder
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic v2 request/response
│   │   ├── middleware/             # Request logging
│   │   └── main.py                 # App factory
│   ├── alembic/                    # Database migrations
│   ├── tests/                      # pytest test suite (30+ tests)
│   ├── Dockerfile
│   ├── render.yaml
│   ├── Makefile
│   └── requirements.txt
│
├── 📄 docker-compose.yml           # Full-stack local development
├── 📄 DEPLOYMENT.md                # Step-by-step deployment guide
└── 📄 README.md                    # You are here
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

> One command to run the entire stack locally.

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/skykart.git
cd skykart

# 2. Start all services
docker-compose up --build

# 3. Seed sample data (new terminal)
docker exec skykart_backend python -m app.database.seed
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

### Option B — Manual Setup

**Backend**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Seed sample data
python -m app.database.seed

# Start development server
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

---

## 🔑 Demo Credentials

After running the seeder:

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@skykart.com | Admin@123 |
| 👤 User | alice@example.com | Alice@123 |
| 👤 User | bob@example.com | Bob@1234 |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Full interactive docs at `/docs`.

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Create new account | Public |
| `POST` | `/auth/login` | Login → returns JWT tokens | Public |
| `POST` | `/auth/refresh` | Refresh access token | Public |
| `GET` | `/auth/me` | Get current user | Required |
| `POST` | `/auth/change-password` | Change password | Required |

</details>

<details>
<summary><strong>🛍️ Products & Categories</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/products` | List products (search, filter, sort, paginate) | Public |
| `GET` | `/products/{slug}` | Get product detail | Public |
| `GET` | `/products/featured` | Get featured products | Public |
| `POST` | `/products` | Create product | Admin |
| `PATCH` | `/products/{id}` | Update product | Admin |
| `DELETE` | `/products/{id}` | Soft-delete product | Admin |
| `GET` | `/categories` | List all categories | Public |
| `POST` | `/categories` | Create category | Admin |

</details>

<details>
<summary><strong>🛒 Cart</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/cart` | Get current cart | Required |
| `POST` | `/cart/items` | Add item (upsert) | Required |
| `PATCH` | `/cart/items/{id}` | Update quantity | Required |
| `DELETE` | `/cart/items/{id}` | Remove item | Required |
| `DELETE` | `/cart` | Clear entire cart | Required |

</details>

<details>
<summary><strong>📦 Orders</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/orders` | Checkout → place order | Required |
| `GET` | `/orders` | My order history | Required |
| `GET` | `/orders/{id}` | Order detail | Required |
| `POST` | `/orders/{id}/cancel` | Cancel order | Required |
| `GET` | `/admin/orders` | All orders (admin) | Admin |
| `PATCH` | `/admin/orders/{id}/status` | Update order status | Admin |

</details>

<details>
<summary><strong>💳 Payments</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/payments/create-order` | Init Razorpay order | Required |
| `POST` | `/payments/verify` | Verify payment signature | Required |
| `GET` | `/payments/order/{id}` | Payment status | Required |
| `POST` | `/payments/webhook` | Razorpay webhook | Public |

</details>

---

## 🗄️ Database Schema

```
users ──────────────────────────────────────────────────────┐
  id (PK, UUID)                                             │
  email (UNIQUE, indexed)                                   │
  full_name · phone · password_hash                         │
  role (user|admin) · is_active · is_verified               │
                                                            │
categories ──────────────────────────────────────────────── │ ──┐
  id (PK) · name · slug (UNIQUE) · parent_id (self-FK)      │   │
                                                            │   │
products ────────────────────────────────────────────────── │ ──┤
  id (PK) · name · slug (UNIQUE) · price · compare_price    │   │
  stock_quantity · image_urls[] · tags[]                     │   │
  category_id (FK → categories)                             │   │
                                                            │   │
cart_items                                                  │   │
  id (PK) · user_id (FK) · product_id (FK) · quantity       │   │
  UNIQUE(user_id, product_id)                               │   │
                                                            │   │
addresses                                                   │   │
  id (PK) · user_id (FK) · full_name · phone                │   │
  line1 · city · state · pincode · is_default               │   │
                                                            │   │
orders                                                      │   │
  id (PK) · user_id (FK) · address_id (FK)                  │   │
  status (pending→confirmed→shipped→delivered)              │   │
  subtotal · shipping · total_amount                        │   │
                                                            │   │
order_items  ← price snapshot at time of purchase           │   │
  id (PK) · order_id (FK) · product_id (FK)                 │   │
  product_name · unit_price · quantity · subtotal            │   │
                                                            │   │
payments                                                    │   │
  id (PK) · order_id (FK, UNIQUE)                           │   │
  gateway_order_id · gateway_payment_id · status            │   │
                                                            │   │
reviews                                                     │   │
  id (PK) · user_id (FK) · product_id (FK)                  │   │
  rating (1-5) · title · comment                            │   │
```

---

## 🔒 Security

- **JWT tokens** — short-lived access (60min) + long-lived refresh (7 days) with silent rotation
- **bcrypt hashing** — passwords never stored plain, work factor ≥ 12
- **HMAC-SHA256** — Razorpay payment signatures verified server-side before confirming orders
- **RBAC** — role guards at dependency injection level, not just route level
- **CORS** — locked to specific frontend domain in production
- **Schema separation** — `password_hash` structurally impossible to leak in API responses
- **UUID primary keys** — no sequential ID enumeration attacks
- **Soft deletes** — products deactivated, never hard-deleted (preserves order history)

---

## 🧪 Testing

```bash
cd backend

# Run all tests
make test

# Run with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v
```

**Test coverage:**
- `test_auth.py` — registration, login, token validation, password change
- `test_products.py` — CRUD, search, admin guards, soft delete
- `test_cart.py` — add/remove/update, stock validation, upsert logic
- `test_users.py` — profile update, address management

---

## 📦 Deployment

See [**DEPLOYMENT.md**](DEPLOYMENT.md) for the complete guide.

**Quick summary:**

```bash
# Backend → Render.com
# Build: pip install -r requirements.txt && alembic upgrade head
# Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Frontend → Vercel
# Root: frontend/
# Env: NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
```

CI/CD runs automatically on every push to `main` via GitHub Actions.

---

## 🗺️ Roadmap

- [x] Phase 0 — Architecture & Planning
- [x] Phase 1 — Backend Foundation (FastAPI + Auth + PostgreSQL)
- [x] Phase 2 — Products & Categories API
- [x] Phase 3 — Cart & Orders System
- [x] Phase 4 — Next.js Frontend
- [x] Phase 5 — Razorpay Payment Integration
- [x] Phase 6 — Admin Dashboard
- [x] Phase 7 — Docker + Vercel + Render + CI/CD
- [ ] Phase 8 — Redis caching + rate limiting
- [ ] Phase 9 — AI product recommendations (embeddings)
- [ ] Phase 10 — Seller marketplace
- [ ] Phase 11 — Real-time inventory (WebSockets)
- [ ] Phase 12 — Microservices migration

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Open a Pull Request
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ as a production-grade engineering project.

⭐ **Star this repo if you found it helpful!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=6C63FF&height=100&section=footer" width="100%"/>

</div>


## 👨‍💻 Author

**Akash Kumar Saw**

AI & Machine Learning Enthusiast | Software Engineer

[![LinkedIn]](https://www.linkedin.com/in/akash-kumar-saw-bb1630258/)

Feel free to connect with me on LinkedIn and explore my other projects.
