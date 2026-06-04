# SKYKART — Deployment Guide

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial SKYKART project"
git remote add origin https://github.com/aako-aakash/skykart.git
git push -u origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo, select the `backend/` directory
3. Set:
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version:** 3.11
4. Add environment variables:
   ```
   APP_ENV=production
   DEBUG=False
   SECRET_KEY=<generate a strong random key>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   RAZORPAY_KEY_ID=<your key>
   RAZORPAY_KEY_SECRET=<your secret>
   RAZORPAY_WEBHOOK_SECRET=<your webhook secret>
   ```
5. Add a **PostgreSQL** database — Render auto-injects `DATABASE_URL`
6. Click **Deploy** — takes ~3 minutes
7. Note your backend URL: `https://skykart-backend.onrender.com`

---

## Step 3 — Deploy Frontend on Vercel

```bash
cd frontend
npx vercel --prod
```

Or via Vercel dashboard:
1. Import GitHub repo
2. Set root directory to `frontend/`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://skykart-backend.onrender.com/api/v1
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   ```
4. Deploy

---

## Step 4 — Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add endpoint: `https://skykart-backend.onrender.com/api/v1/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Copy the webhook secret → add as `RAZORPAY_WEBHOOK_SECRET` in Render env vars

---

## Step 5 — Seed Production Data (Optional)

```bash
# SSH into Render or use their shell
python -m app.database.seed
```

---

## Step 6 — Verify

- Frontend: https://your-app.vercel.app
- API Docs: disabled in production (set `DEBUG=True` temporarily if needed)
- Health check: `GET https://skykart-backend.onrender.com/health`

---

## Docker (Self-Hosted)

```bash
# Build and run everything
docker-compose up --build -d

# Apply migrations
docker exec skykart_backend alembic upgrade head

# Seed data
docker exec skykart_backend python -m app.database.seed

# View logs
docker-compose logs -f
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | ✅ | PostgreSQL connection string |
| SECRET_KEY | ✅ | JWT signing key (min 32 chars) |
| APP_ENV | ✅ | development / production |
| ALLOWED_ORIGINS | ✅ | Frontend URL(s), comma-separated |
| RAZORPAY_KEY_ID | Payments | From Razorpay dashboard |
| RAZORPAY_KEY_SECRET | Payments | From Razorpay dashboard |
| RAZORPAY_WEBHOOK_SECRET | Payments | From Razorpay webhook settings |

### Frontend (.env.local)
| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_API_URL | ✅ | Backend API base URL |
| NEXT_PUBLIC_RAZORPAY_KEY_ID | Payments | Public Razorpay key |
