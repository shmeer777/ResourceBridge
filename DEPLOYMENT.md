# ResourceBridge — Production Deployment Guide

This guide details the complete deployment setup for ResourceBridge:
- **Frontend**: Cloudflare Pages (React + Vite + TypeScript)
- **Backend**: Google Cloud Run (FastAPI + Docker)
- **Database**: Supabase PostgreSQL

---

## 1. Database (Supabase PostgreSQL)

Your Supabase PostgreSQL database is already configured. 
Ensure you have your Connection String handy:
```text
postgresql+psycopg://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres
```
*(Tip: When connecting from serverless environments like Cloud Run, using the Supabase Connection Pooler hostname `aws-0-[region].pooler.supabase.com` on port `5432` (Session mode) or `6543` (Transaction mode) ensures reliable IPv4 resolution).*

### Safe Migration Procedure
To prevent migration race conditions or table locks when Cloud Run autoscales multiple container instances, automatic migration execution on container startup is disabled by default (`RUN_MIGRATIONS_ON_STARTUP=False`).

Run migrations explicitly once prior to or during deployment:

```bash
# From your development machine or CI/CD pipeline:
cd backend
$env:DATABASE_URL="postgresql+psycopg://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres"
alembic upgrade head
```
*(On Linux/macOS, use `export DATABASE_URL=...` instead of `$env:DATABASE_URL=...`).*

Alembic will inspect the `alembic_version` table in Supabase and only apply new revisions non-destructively.

---

## 2. Backend Deployment (Google Cloud Run)

Google Cloud Run provides an **Always Free** tier that includes:
- **2,000,000 requests** per month
- **180,000 vCPU-seconds** per month
- **360,000 GiB-seconds** per month
- **1 GB egress** per month
- Automatic scale-to-zero when idle (0 cost during inactivity)

### Deployment Option A: Cloud Run Console (Recommended — No CLI Needed)

1. Open the [Google Cloud Console Cloud Run Page](https://console.cloud.google.com/run).
2. Select your Google Cloud Project (or create a new project with billing enabled).
3. Click **Create Service** (or **Deploy Container**).
4. Select **Continuously deploy from a repository** and click **Set up Cloud Build**:
   - Provider: **GitHub**
   - Repository: `shmeer777/ResourceBridge`
   - Branch: `^main$`
   - Build Type: **Dockerfile**
   - Source directory: `/backend`
   - Dockerfile path: `Dockerfile`
5. Service configuration:
   - **Service name**: `resourcebridge-api`
   - **Region**: Choose a region close to you (e.g. `us-central1`, `asia-south1`, etc.)
   - **Authentication**: Select **Allow unauthenticated invocations** (public API)
6. Under **Container, Volumes, Networking, Security** -> **Container**:
   - **Container port**: `8080`
   - **Capacity**: Memory `512 MiB`, CPU `1`
   - **Environment variables**:
     - `ENVIRONMENT`: `production`
     - `DATABASE_URL`: `postgresql+psycopg://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
     - `JWT_SECRET_KEY`: A strong 64+ character random string
     - `CORS_ORIGINS`: `https://resourcebridge.pages.dev`
     - `DB_POOL_SIZE`: `3`
     - `DB_MAX_OVERFLOW`: `2`
7. Click **Create**.
8. Cloud Build will build the container and deploy the service. Note the assigned service URL: `https://resourcebridge-api-xxxxxx.a.run.app`.

### Deployment Option B: Google Cloud CLI (`gcloud`)

If you have `gcloud` installed locally:

```bash
# 1. Log in and configure your project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Deploy directly from the backend source folder
gcloud run deploy resourcebridge-api \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars ENVIRONMENT="production",DATABASE_URL="YOUR_SUPABASE_URL",JWT_SECRET_KEY="YOUR_SECRET",CORS_ORIGINS="https://resourcebridge.pages.dev",DB_POOL_SIZE="3",DB_MAX_OVERFLOW="2"
```

### Backend Health Check Verification
Once deployed, verify in your browser or curl:
- `https://<YOUR-CLOUD-RUN-URL>/health/live` -> Liveness (process running)
- `https://<YOUR-CLOUD-RUN-URL>/health/ready` -> Readiness (database connection verified)
- `https://<YOUR-CLOUD-RUN-URL>/docs` -> Interactive Swagger API documentation

---

## 3. Frontend Deployment (Cloudflare Pages)

Cloudflare Pages provides free hosting with unlimited bandwidth, global CDN caching, and automatic continuous deployment on every Git push.

### Step 3.1: Connect Your GitHub Repository
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** in the sidebar.
3. Click **Create application** -> **Pages** tab -> **Connect to Git**.
4. Select `shmeer777/ResourceBridge`.

### Step 3.2: Set Up Build Configuration
- **Project name**: `resourcebridge`
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 3.3: Set Environment Variables
Under **Environment variables (advanced)** -> Add variable:
- **Variable name**: `VITE_API_BASE_URL`
- **Value**: `https://<YOUR-CLOUD-RUN-URL>/api/v1`

*(Example: `https://resourcebridge-api-xyz-uc.a.run.app/api/v1`)*

### Step 3.4: Deploy & Verify
1. Click **Save and Deploy**.
2. Cloudflare will install dependencies, compile the TypeScript bundle (`npm run build`), and deploy to `https://resourcebridge.pages.dev`.
3. The included `_redirects` file (`/* /index.html 200`) ensures client-side routing on page refresh works seamlessly.

---

## 4. End-to-End Live Verification Checklist

Once both services are running:
1. **Public Discovery**: Visit `https://resourcebridge.pages.dev/explore` and verify active resources load from Supabase.
2. **Seeker Registration & Login**: Create a new seeker account and log in.
3. **Provider Login & Dashboard**: Log in using provider credentials and verify listed resources.
4. **Booking Flow**: As a seeker, submit a booking inquiry for an available resource.
5. **Provider Decision**: As provider, view the pending request, accept or reject it.
6. **Messaging System**: Open the booking conversation modal and exchange messages in real time.
