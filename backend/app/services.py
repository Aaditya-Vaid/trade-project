from datetime import UTC, datetime, timedelta
from math import floor

REFRESH_INTERVAL_SECONDS = 10
STALE_THRESHOLD_SECONDS = 15
DEFAULT_VIRTUAL_CAPITAL = 1_000_000


def _now() -> datetime:
    return datetime.now(tz=UTC)


def _watchlist_row(symbol: str, company_name: str, ltp: float, change_percent: float, volume: int, vwap: float, signal: str) -> dict:
    previous_close = ltp / (1 + change_percent / 100)
    change = ltp - previous_close
    high = max(ltp, previous_close) * 1.006
    low = min(ltp, previous_close) * 0.994
    timestamp = _now()
    return {
        "symbol": symbol,
        "companyName": company_name,
        "ltp": ltp,
        "change": change,
        "changePercent": change_percent,
        "open": previous_close * 1.001,
        "high": high,
        "low": low,
        "previousClose": previous_close,
        "volume": volume,
        "volumeVsAverage": 0.75 + abs(change_percent) / 2,
        "vwap": vwap,
        "bid": ltp - 0.1,
        "ask": ltp + 0.1,
        "bidQuantity": round(500 + volume / 9000),
        "askQuantity": round(450 + volume / 9200),
        "dayRangePosition": ((ltp - low) / (high - low)) * 100,
        "signal": signal,
        "sourceTimestamp": timestamp,
        "receivedTimestamp": timestamp,
        "displayedTimestamp": timestamp,
    }


def _suggested_quantity(entry_low: float, entry_high: float, stop_loss: float, risk_percent: float = 0.75) -> int:
    midpoint = (entry_low + entry_high) / 2
    per_share_risk = max(0.05, abs(midpoint - stop_loss))
    return floor((DEFAULT_VIRTUAL_CAPITAL * (risk_percent / 100)) / per_share_risk)


def get_dashboard_snapshot() -> dict:
    now = _now()
    suggestions = [
        {
            "symbol": "RELIANCE",
            "signalType": "Buy",
            "confidence": 78,
            "entryLow": 2912,
            "entryHigh": 2922,
            "stopLoss": 2894,
            "target1": 2946,
            "target2": 2968,
            "riskReward": 2.1,
            "suggestedQuantity": _suggested_quantity(2912, 2922, 2894),
            "reasons": ["Price holding above VWAP", "EMA 9 is above EMA 20", "Relative volume is 1.4x intraday average"],
            "warnings": ["Use only with licensed real-time feed connected"],
            "invalidationCondition": "Avoid fresh entries if price closes below VWAP for two refresh cycles.",
            "expiresAt": now + timedelta(minutes=20),
            "calculatedAt": now,
        },
        {
            "symbol": "HDFCBANK",
            "signalType": "Sell",
            "confidence": 66,
            "entryLow": 1664,
            "entryHigh": 1669,
            "stopLoss": 1682,
            "target1": 1642,
            "target2": 1628,
            "riskReward": 1.7,
            "suggestedQuantity": _suggested_quantity(1664, 1669, 1682),
            "reasons": ["Rejected VWAP after weak opening range", "RSI slipped below 50", "Bank index trend is unsupportive"],
            "warnings": ["Minimum risk/reward is barely satisfied"],
            "invalidationCondition": "Signal invalid if bid/ask spread widens above configured threshold.",
            "expiresAt": now + timedelta(minutes=15),
            "calculatedAt": now,
        },
    ]

    return {
        "marketStatus": "open",
        "refreshIntervalSeconds": REFRESH_INTERVAL_SECONDS,
        "staleThresholdSeconds": STALE_THRESHOLD_SECONDS,
        "indices": [
            {"name": "NIFTY 50", "ltp": 24836.3, "change": 126.15, "changePercent": 0.51, "open": 24728.1, "high": 24882.4, "low": 24690.8, "previousClose": 24710.15, "trend": "up"},
            {"name": "NIFTY Bank", "ltp": 53354.9, "change": -84.4, "changePercent": -0.16, "open": 53482.2, "high": 53620.7, "low": 53280.5, "previousClose": 53439.3, "trend": "down"},
            {"name": "NIFTY Midcap", "ltp": 57412.7, "change": 318.6, "changePercent": 0.56, "open": 57124.0, "high": 57560.2, "low": 57088.4, "previousClose": 57094.1, "trend": "up"},
            {"name": "NIFTY IT", "ltp": 35628.5, "change": 24.75, "changePercent": 0.07, "open": 35580.9, "high": 35740.1, "low": 35494.4, "previousClose": 35603.75, "trend": "flat"},
        ],
        "watchlist": [
            _watchlist_row("RELIANCE", "Reliance Industries", 2918.45, 1.24, 2_378_000, 2910.2, "Buy"),
            _watchlist_row("HDFCBANK", "HDFC Bank", 1668.25, -0.44, 3_892_000, 1675.6, "Sell"),
            _watchlist_row("INFY", "Infosys", 1482.8, 0.18, 1_288_000, 1478.4, "Hold"),
            _watchlist_row("TCS", "Tata Consultancy Services", 3866.1, 0.72, 822_000, 3842.5, "Watch"),
            _watchlist_row("TATAMOTORS", "Tata Motors", 965.7, -1.08, 4_710_000, 974.9, "Avoid"),
            _watchlist_row("SBIN", "State Bank of India", 842.35, 0.95, 5_421_000, 835.6, "Buy"),
        ],
        "suggestions": suggestions,
        "alerts": [
            {"id": "feed", "severity": "info", "label": "Licensed feed mode", "detail": "Demo snapshots are placeholders until an authorized NSE/vendor/broker data source is configured.", "timestamp": now},
            {"id": "risk", "severity": "warning", "label": "Risk guard active", "detail": "Signals below 1.5 risk/reward are downgraded to Watch or Avoid.", "timestamp": now},
            {"id": "sim", "severity": "info", "label": "Simulation Mode", "detail": "Fake-money fills pause automatically when displayed market data is stale.", "timestamp": now},
        ],
        "simulation": {
            "virtualCashBalance": DEFAULT_VIRTUAL_CAPITAL,
            "startingVirtualCapital": DEFAULT_VIRTUAL_CAPITAL,
            "realizedPnl": 12250,
            "unrealizedPnl": -3450,
            "maxDrawdown": 18500,
            "openPositions": 3,
            "winRate": 58,
            "ruleAdherence": 84,
        },
    }
