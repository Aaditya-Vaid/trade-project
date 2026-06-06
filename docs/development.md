# NSE Intraday Trading Dashboard Development Guide

This guide documents the MVP implementation for the real-time NSE intraday trading dashboard described in `docs/real-time-trading-dashboard-prd.md`.

## Repository layout

```text
frontend/   TypeScript browser dashboard, styling, build script, and static server
backend/    FastAPI API scaffold for dashboard snapshots, watchlists, suggestions, alerts, and simulation data
docs/       Product requirements and development documentation
```

## What is included

- Dense trading-terminal frontend UI with pinned NSE index cards.
- Default NSE watchlist with LTP, OHLC, volume, VWAP, bid/ask, day-range, signal, and freshness columns.
- 10-second on-screen refresh cadence with a countdown timer.
- Stale-data guardrail messaging for signals and fake-money simulation fills.
- Explainable buy/sell/hold/watch/avoid suggestion card with entry, stop, targets, confidence, risk/reward, quantity, and rationale.
- Risk-per-trade control and fake-money simulation analytics panel.
- FastAPI backend scaffold with health, dashboard snapshot, market overview, watchlist, suggestion, and simulation endpoints.
- Dockerfiles for frontend/backend plus a root `docker-compose.yml` to run both services together.

> Demo values are placeholders. Production use must integrate an authorized NSE Data & Analytics feed, licensed vendor, or broker API and must follow exchange/vendor data policies.

## Local development

### Frontend

```bash
cd frontend
npm run check
npm run build
npm run dev
```

The frontend production bundle is written to `frontend/dist/` by `npm run build`.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Key API routes:

- `GET /health`
- `GET /api/dashboard`
- `GET /api/market-overview`
- `GET /api/watchlists/default`
- `GET /api/suggestions`
- `GET /api/simulation`

## Docker

```bash
docker compose up --build
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000>
- Backend health: <http://localhost:8000/health>
