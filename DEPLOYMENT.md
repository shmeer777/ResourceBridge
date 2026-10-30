# ResourceBridge — Complete Production Deployment Guide

This guide details the complete zero-billing, free-tier deployment setup for ResourceBridge:
- **Frontend**: Cloudflare Pages (React + TypeScript + Vite) — Free Plan
- **Backend**: Render Web Service (FastAPI + Python) — Free Instance
- **Database**: Supabase PostgreSQL — Existing Free Tier Database

---

## 1. Hosting Architecture & Free-Tier Characteristics

| Component | Platform & Tier | Resource Limits | Cold Start / Inactivity Behavior | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Cloudflare Pages (Free) | Unlimited bandwidth & requests, 500 builds/mo | Instant (Edge CDN, always on) | Free |
| **Backend** | Render (Free Web Service) | 512 MB RAM, 0.1 vCPU, 750 free instance hrs/mo | Sleeps after 15m inactivity; wakes on request (~30–50s) | Free |
| **Database** | Supabase (Free Tier) | 500 MB database, shared pooler | Existing database preserved; pauses after 1w inactivity | Free |

---

## 2. Database (Existing Supabase PostgreSQL)

Your Supabase PostgreSQL database is preserved. Zero tables or data should be dropped or reset.

### Safe Connection String Format
In the Supabase Dashboard -> **Project Settings** -> **Database** -> **Connection string** -> Select **URI**:
- Use the **Connection Pooler** URI (recommended for serverless/cloud environments on port `6543` for Transaction mode or `5432` for Session mode):
  ```text
  postgresql+psycopg://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```
- *Note on driver*: SQLAlchemy with Psycopg 3 uses `postgresql+psycopg://`. If your raw string starts with `postgres://` or `postgresql://`, the application automatically normalizes it to `postgresql+psycopg://`.

### Explicit Migration Procedure
Automatic database migrations during application startup are disabled (`RUN_MIGRATIONS_ON_STARTUP=false`) to avoid startup delays or conflicts.

If schema migrations are needed in the future, run them explicitly once from your secure administrative machine:
```powershell
cd backend
$env:DATABASE_URL="postgresql+psycopg://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
alembic upgrade head
```

---

## 3. Backend Deployment (Render Free Web Service)

### Step 3.1: Create Web Service on Render
1. Log in to [render.com](https://render.com/) (sign up with GitHub if you do not have an account; no credit card required).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** -> Choose `shmeer777/ResourceBridge`.
4. Configure service parameters:
   - **Name**: `resourcebridge-api`
   - **Region**: Choose a region close to your Supabase project (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Click **Advanced** -> Configure:
   - **Health Check Path**: `/health/live`
   - **Auto-Deploy**: `Yes`

### Step 3.2: Configure Render Environment Variables
Under the **Environment** tab, add the following variables:

| Variable Name | Required Value / Source |
| :--- | :--- |
| `ENVIRONMENT` | `production` |
| `PYTHON_VERSION` | `3.11.9` |
| `DATABASE_URL` | Your Supabase connection URI (`postgresql+psycopg://...`) |
| `JWT_SECRET_KEY` | A cryptographically secure random string (minimum 32 characters) |
| `CORS_ORIGINS` | Temporary placeholder: `https://resourcebridge.pages.dev` *(update after Step 4)* |
| `DB_POOL_SIZE` | `3` |
| `DB_MAX_OVERFLOW` | `2` |
| `DB_POOL_TIMEOUT` | `15` |
| `DB_POOL_RECYCLE` | `300` |
| `RUN_MIGRATIONS_ON_STARTUP` | `false` |

6. Click **Create Web Service**.
7. Render will build the dependencies and start Uvicorn. Note the assigned URL:
   `https://resourcebridge-api-xxxx.onrender.com`

---

## 4. Frontend Deployment (Cloudflare Pages)

### Step 4.1: Connect Repository to Cloudflare Pages
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com/).
2. In the sidebar, select **Workers & Pages**.
3. Click **Create application** -> **Pages** tab -> **Connect to Git**.
4. Select repository `shmeer777/ResourceBridge`.

### Step 4.2: Build Configuration
Configure the build settings:
- **Project name**: `resourcebridge` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Root directory**: `frontend`
- **Build command**: `npm run build` *(or `npm ci && npm run build`)*
- **Build output directory**: `dist`

### Step 4.3: Set Frontend Environment Variable
Under **Environment variables (advanced)** -> Add variable:
- **Variable name**: `VITE_API_BASE_URL`
- **Value**: `https://<YOUR-RENDER-URL>.onrender.com/api/v1`
  *(Crucial: Must include the `/api/v1` path suffix to match the frontend API client)*

### Step 4.4: Deploy
1. Click **Save and Deploy**.
2. Cloudflare Pages will build the frontend in ~1–2 minutes and assign your live domain:
   `https://<project-name>.pages.dev`

---

## 5. Final Step: Lock Down Production CORS

Once Cloudflare Pages deploys and you have your exact assigned domain (e.g. `https://resourcebridge-abc.pages.dev`):

1. Go back to your [Render Dashboard](https://dashboard.render.com/) -> Select `resourcebridge-api`.
2. Go to **Environment** tab.
3. Edit `CORS_ORIGINS` to match your exact Cloudflare Pages origin:
   ```text
   CORS_ORIGINS = https://<your-project-name>.pages.dev
   ```
4. Click **Save Changes**. Render will automatically trigger a zero-downtime redeploy with the updated CORS configuration.

---

## 6. Post-Deployment Verification

### Backend Verification
- Liveness check (process alive):
  `https://<your-backend>.onrender.com/health/live` -> `{"status":"alive",...}`
- Database readiness check (Supabase connectivity verified):
  `https://<your-backend>.onrender.com/health/ready` -> `{"status":"ready","database":"connected",...}`
- Swagger documentation:
  `https://<your-backend>.onrender.com/docs`

### Frontend Verification
- Open `https://<your-project-name>.pages.dev`
- Verify homepage loads and navigation routes work.
- Reload sub-routes (e.g. `/role-selection`) to verify SPA `_redirects` routing.
- Test Seeker/Provider login and registration.
- Verify resources load from Supabase and messaging functions properly.
