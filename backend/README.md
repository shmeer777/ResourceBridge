---
title: ResourceBridge API
emoji: 🌉
colorFrom: cyan
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# ResourceBridge API — Production Deployment

Production FastAPI backend for ResourceBridge, an institutional equipment & space sharing network.

## Endpoints
- **Health Check**: `GET /health` or `GET /api/v1/health`
- **Interactive Swagger Docs**: `GET /docs`
- **ReDoc**: `GET /redoc`
- **Core API Prefix**: `/api/v1`

## Required Environment Variables / Secrets
Set these in your Hugging Face Space Settings under **Variables and secrets**:
- `DATABASE_URL`: Your Supabase PostgreSQL connection URI (`postgresql+psycopg://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`)
- `JWT_SECRET_KEY`: A strong random string for signing JWT authentication tokens
- `FRONTEND_ORIGIN`: Your Cloudflare Pages URL (e.g. `https://resourcebridge.pages.dev`)
- `CORS_ORIGINS`: Comma-separated list of allowed origins (e.g. `https://resourcebridge.pages.dev,http://localhost:5173`)

