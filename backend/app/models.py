from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SignalState = Literal["Buy", "Sell", "Hold", "Avoid", "Watch"]
MarketStatus = Literal["pre-open", "open", "closed", "post-close", "holiday", "feed unavailable"]


class MarketIndex(BaseModel):
    name: str
    ltp: float
    change: float
    change_percent: float = Field(alias="changePercent")
    open: float
    high: float
    low: float
    previous_close: float = Field(alias="previousClose")
    trend: Literal["up", "down", "flat"]


class WatchlistRow(BaseModel):
    symbol: str
    company_name: str = Field(alias="companyName")
    ltp: float
    change: float
    change_percent: float = Field(alias="changePercent")
    open: float
    high: float
    low: float
    previous_close: float = Field(alias="previousClose")
    volume: int
    volume_vs_average: float = Field(alias="volumeVsAverage")
    vwap: float
    bid: float
    ask: float
    bid_quantity: int = Field(alias="bidQuantity")
    ask_quantity: int = Field(alias="askQuantity")
    day_range_position: float = Field(alias="dayRangePosition")
    signal: SignalState
    source_timestamp: datetime = Field(alias="sourceTimestamp")
    received_timestamp: datetime = Field(alias="receivedTimestamp")
    displayed_timestamp: datetime = Field(alias="displayedTimestamp")


class TradeSuggestion(BaseModel):
    symbol: str
    signal_type: SignalState = Field(alias="signalType")
    confidence: int
    entry_low: float = Field(alias="entryLow")
    entry_high: float = Field(alias="entryHigh")
    stop_loss: float = Field(alias="stopLoss")
    target1: float
    target2: float
    risk_reward: float = Field(alias="riskReward")
    suggested_quantity: int = Field(alias="suggestedQuantity")
    reasons: list[str]
    warnings: list[str]
    invalidation_condition: str = Field(alias="invalidationCondition")
    expires_at: datetime = Field(alias="expiresAt")
    calculated_at: datetime = Field(alias="calculatedAt")


class AlertItem(BaseModel):
    id: str
    severity: Literal["info", "warning", "critical"]
    label: str
    detail: str
    timestamp: datetime


class SimulationState(BaseModel):
    virtual_cash_balance: float = Field(alias="virtualCashBalance")
    starting_virtual_capital: float = Field(alias="startingVirtualCapital")
    realized_pnl: float = Field(alias="realizedPnl")
    unrealized_pnl: float = Field(alias="unrealizedPnl")
    max_drawdown: float = Field(alias="maxDrawdown")
    open_positions: int = Field(alias="openPositions")
    win_rate: float = Field(alias="winRate")
    rule_adherence: float = Field(alias="ruleAdherence")


class DashboardSnapshot(BaseModel):
    market_status: MarketStatus = Field(alias="marketStatus")
    refresh_interval_seconds: int = Field(alias="refreshIntervalSeconds")
    stale_threshold_seconds: int = Field(alias="staleThresholdSeconds")
    indices: list[MarketIndex]
    watchlist: list[WatchlistRow]
    suggestions: list[TradeSuggestion]
    alerts: list[AlertItem]
    simulation: SimulationState
