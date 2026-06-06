from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import DashboardSnapshot
from app.services import get_dashboard_snapshot

app = FastAPI(
    title="NSE Intraday Trading Dashboard API",
    description="Backend API scaffold for licensed market-data snapshots, explainable suggestions, alerts, and fake-money simulation.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=DashboardSnapshot, response_model_by_alias=True)
def dashboard() -> dict:
    return get_dashboard_snapshot()


@app.get("/api/market-overview")
def market_overview() -> dict:
    snapshot = get_dashboard_snapshot()
    return {
        "marketStatus": snapshot["marketStatus"],
        "refreshIntervalSeconds": snapshot["refreshIntervalSeconds"],
        "staleThresholdSeconds": snapshot["staleThresholdSeconds"],
        "indices": snapshot["indices"],
    }


@app.get("/api/watchlists/default")
def default_watchlist() -> dict:
    return {"name": "Default NSE watchlist", "items": get_dashboard_snapshot()["watchlist"]}


@app.get("/api/suggestions")
def suggestions() -> dict:
    return {"items": get_dashboard_snapshot()["suggestions"]}


@app.get("/api/simulation")
def simulation() -> dict:
    return get_dashboard_snapshot()["simulation"]
