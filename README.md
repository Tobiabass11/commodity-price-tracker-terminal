# Commodity Price Tracker

A desktop-first React + Node application for monitoring major commodity markets (WTI, Brent, Natural Gas, Gold, Silver, Copper, Wheat) with a terminal-style interface.

## Features

- 30s dashboard polling through an Express middleware API.
- Simulated between-poll micro-ticks labeled clearly as `Simulated`.
- Detailed candlestick chart panel with range switching and MA20/MA50 overlays.
- Volume bars, watchlist pinning, and configurable price threshold alerts.
- In-app toast alerts plus optional browser notifications and sound alerts.
- News sidebar powered by NewsAPI, refreshed every 5 minutes.
- Quota exhausted banner + automatic stale-cache fallback for free-tier APIs.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Zustand, TanStack Query, lightweight-charts, Recharts.
- Backend: Node.js, Express, TypeScript.
- Testing: Vitest + Supertest + Playwright (smoke).
- Deployment: Vercel (web), Render (API).

## Monorepo layout

- `apps/web` - frontend app.
- `apps/api` - Express middleware API.
- `packages/shared` - shared types and constants.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. Start API + web:

```bash
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8080`

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e --workspace @commodity-tracker/web`

## API routes

- `GET /health`
- `GET /api/commodities/snapshot`
- `GET /api/commodities/:symbol/history?range=1D|5D|1M|3M|1Y`
- `GET /api/news?commodity=WTI|BRENT|NATURAL_GAS|GOLD|SILVER|COPPER|WHEAT`

## Deployment

### Render (API)

1. Create a Render Web Service from this repo.
2. Use `render.yaml` or equivalent settings:
- Build command: `npm ci && npm run build --workspace @commodity-tracker/api`
- Start command: `npm run start --workspace @commodity-tracker/api`
3. Set env vars: `ALPHA_VANTAGE_API_KEY`, `NEWS_API_KEY`, `ALLOWED_ORIGIN`.

### Vercel (Web)

1. Create a Vercel project connected to this repo.
2. Build command: `npm ci && npm run build --workspace @commodity-tracker/web`.
3. Output directory: `apps/web/dist`.
4. Add env var: `VITE_API_BASE_URL=https://<render-service>.onrender.com`.

## Notes on free-tier limits

Alpha Vantage free-tier quotas are strict. The API layer caches responses and returns stale data when limits are hit, with `meta.quotaExhausted=true` so the frontend can display a warning banner.
