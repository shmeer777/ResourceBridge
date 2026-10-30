# ResourceBridge — Production Deployment Guide

This guide details the complete deployment setup for ResourceBridge:
- **Frontend**: Cloudflare Pages (React + Vite + TypeScript)
- **Backend**: Hugging Face Spaces (FastAPI + Docker) or Render
- **Database**: Supabase PostgreSQL

---

## 1. Database (Supabase PostgreSQL)

Your Supabase PostgreSQL database is already configured. 
Ensure you have your Connection String handy:
```text
postgresql+psycopg://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres
```
*(Or use Transaction Pooler port 6543 if your network requires IPv4 compatibility)*

---

## 2. Backend Deployment (Hugging Face Spaces)

Hugging Face Spaces provides a free Docker hosting tier with 2 vCPUs and 16 GB RAM.

### Step 2.1: Create a New Space
1. Log in to [huggingface.co](https://huggingface.co/) (create a free account if you don't have one).
2. Click your profile avatar -> **New Space** (or visit [huggingface.co/new-space](https://huggingface.co/new-space)).
3. Fill in:
   - **Space name**: `resourcebridge-api`
   - **License**: `mit` (or choose your preferred license)
   - **Space SDK**: Select **Docker** -> **Blank**
   - **Space hardware**: `Free - 2 vCPU · 16GB`
   - **Visibility**: `Public` (required for free tier web endpoints)
4. Click **Create Space**.

### Step 2.2: Configure Environment Variables & Secrets
In your newly created Space:
1. Go to **Settings** -> **Variables and secrets**.
2. Under **Secrets** (New secret), add:
   - `DATABASE_URL`: `postgresql+psycopg://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
   - `JWT_SECRET_KEY`: A strong 64+ character random string
3. Under **Variables** (New variable), add:
   - `CORS_ORIGINS`: `https://*.pages.dev,http://localhost:5173`
   - `FRONTEND_ORIGIN`: `https://resourcebridge.pages.dev`

### Step 2.3: Push the Backend to the Space
You can push the backend directly from your local terminal using Git:

```bash
# Add Hugging Face Space as a remote (replace <hf-username> with your HF username)
git remote add hf https://huggingface.co/spaces/<hf-username>/resourcebridge-api

# Push the backend directory to the Space's main branch
git subtree push --prefix backend hf main
```
*Note: When Git prompts for a password, enter your Hugging Face Access Token (generated at https://huggingface.co/settings/tokens with write permissions).*

### Step 2.4: Verify the Backend
Once built, test the endpoints in your browser:
- `https://<hf-username>-resourcebridge-api.hf.space/health` -> `{"status":"ok",...}`
- `https://<hf-username>-resourcebridge-api.hf.space/docs` -> Interactive Swagger UI

---

## 3. Frontend Deployment (Cloudflare Pages)

Cloudflare Pages provides free, unlimited bandwidth, instant global CDN hosting with automatic Git CI/CD.

### Step 3.1: Connect Your GitHub Repository
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com/).
2. In the sidebar, navigate to **Workers & Pages**.
3. Click **Create application** -> **Pages** tab -> **Connect to Git**.
4. Select `shmeer777/ResourceBridge`.

### Step 3.2: Set Up Build Configuration
Configure the build settings as follows:
- **Project name**: `resourcebridge` (or any name you prefer)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 3.3: Set Environment Variables
Under **Environment variables (advanced)** -> Add variable:
- Variable name: `VITE_API_BASE_URL`
- Value: `https://<hf-username>-resourcebridge-api.hf.space/api/v1`

*(Replace `<hf-username>` with your actual Hugging Face username, or use your deployed backend API URL)*

### Step 3.4: Deploy & Verify
1. Click **Save and Deploy**.
2. Cloudflare will install dependencies, run `npm run build`, and deploy the production bundle to `https://resourcebridge.pages.dev` (or your assigned subdomain).
3. The included `_redirects` file (`/* /index.html 200`) ensures client-side routes like `/role-selection`, `/login/provider`, and `/provider/dashboard` reload cleanly.

---

## 4. End-to-End Verification Checklist

Once both services are deployed:
- [ ] Visit the Cloudflare Pages URL: `https://<project-name>.pages.dev`
- [ ] Test Navigation: Explore Resources, How It Works, Role Selection
- [ ] Test Seeker Flow: Register a new Seeker or sign in with demo credentials
- [ ] Test Provider Flow: Sign in with demo Provider credentials, view My Resources
- [ ] Test Resource Creation: Create a test resource and check its public discovery
- [ ] Test Booking Request: Seeker submits a booking inquiry; Provider receives and approves/rejects
- [ ] Test Messaging: Open conversation thread on the booking request and exchange messages
