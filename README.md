# SKYKART 🛒

> A production-grade full-stack ecommerce platform built with Next.js 14, FastAPI, and PostgreSQL.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State      | Zustand + TanStack React Query          |
| Backend    | FastAPI, Python 3.11                    |
| Database   | PostgreSQL + SQLAlchemy 2.0 + Alembic   |
| Auth       | JWT (access + refresh tokens), bcrypt   |
| Payments   | Razorpay                                |
| Deployment | Vercel (frontend) + Render (backend)    |

---

## Quick Start (Local Development)

### Option A — Docker (Recommended)

```bash
git clone https://github.com/yourusername/skykart.git
cd skykart
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### Option B — Manual

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Fill in DATABASE_URL and SECRET_KEY
alembic upgrade head           # Run migrations
python -m app.database.seed    # Seed sample data
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local    # Set NEXT_PUBLIC_API_URL
npm run dev
```

---

## Project Structure

```
skykart/
├── backend/
│   ├── app/
│   │   ├── auth/           JWT auth, dependencies, router
│   │   ├── users/          Profile, addresses
│   │   ├── products/       Products, categories, search
│   │   ├── cart/           Cart management
│   │   ├── orders/         Checkout, order lifecycle
│   │   ├── payments/       Razorpay integration
│   │   ├── admin/          Dashboard, stats, user mgmt
│   │   ├── core/           Config, security, exceptions
│   │   ├── database/       Session, seeder
│   │   ├── models/         SQLAlchemy ORM models
│   │   ├── schemas/        Pydantic v2 schemas
│   │   ├── middleware/      Request logging
│   │   └── main.py         App factory
│   ├── alembic/            DB migrations
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/         login, register
│   │   ├── (shop)/         homepage, products, cart, checkout, orders, account
│   │   └── admin/          dashboard, products, orders, users
│   ├── components/
│   │   ├── ui/             Button, Input, Badge, Skeleton
│   │   ├── layout/         Navbar, Footer
│   │   ├── home/           Hero, Categories, Featured, Stats
│   │   ├── product/        ProductCard, ProductGrid
│   │   └── cart/           CartDrawer
│   ├── services/           API service layer (axios)
│   ├── store/              Zustand stores (auth, cart)
│   ├── types/              TypeScript interfaces
│   ├── utils/              Helpers, formatters
│   ├── Dockerfile
│   └── vercel.json
│
└── docker-compose.yml
```

---

## API Overview

| Module    | Base Path           | Auth       |
|-----------|---------------------|------------|
| Auth      | /api/v1/auth        | Public     |
| Users     | /api/v1/users       | Required   |
| Products  | /api/v1/products    | Public/Admin|
| Cart      | /api/v1/cart        | Required   |
| Orders    | /api/v1/orders      | Required   |
| Payments  | /api/v1/payments    | Required   |
| Admin     | /api/v1/admin       | Admin Only |

Full Swagger docs at `/docs` when running locally.

---

## Seeded Test Accounts

| Role  | Email                 | Password   |
|-------|-----------------------|------------|
| Admin | admin@skykart.com     | Admin@123  |
| User  | alice@example.com     | Alice@123  |
| User  | bob@example.com       | Bob@1234   |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy --prod
# Set env vars: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_RAZORPAY_KEY_ID
```

### Backend → Render
1. Push to GitHub
2. Create Web Service on render.com
3. Point to `backend/` directory
4. Build: `pip install -r requirements.txt && alembic upgrade head`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add PostgreSQL database — Render injects `DATABASE_URL` automatically

---

## Roadmap

- [x] Phase 0 — Architecture & Planning
- [x] Phase 1 — Backend Foundation (FastAPI + Auth + DB)
- [x] Phase 2 — Products & Categories API
- [x] Phase 3 — Cart & Orders System
- [x] Phase 4 — Next.js Frontend
- [x] Phase 5 — Razorpay Payments
- [x] Phase 6 — Admin Dashboard
- [x] Phase 7 — Docker + Vercel + Render Deployment


---

## 👨‍💻 Author

**Akash Kumar Saw**

AI & Machine Learning Enthusiast | Software Engineer

[![LinkedIn]](https://www.linkedin.com/in/akash-kumar-saw-bb1630258/)

Feel free to connect with me on LinkedIn and explore my other projects.
