# Product Requirements Document: Real-Time NSE Intraday Trading Dashboard

## 1. Product Summary

Build a web-based dashboard that displays near real-time National Stock Exchange of India (NSE) market data, refreshes visible metrics every 10 seconds, and provides intraday buy/sell/hold suggestions based on configurable technical-analysis and risk-management rules.

The product is intended for active intraday traders who need a single screen for market overview, watchlist monitoring, technical indicators, order-flow context, alerts, and explainable trade suggestions.

> **Important compliance note:** NSE real-time data must be sourced through an authorized NSE data subscription, NSE Data & Analytics feed, an authorized data vendor, or a licensed broker integration. The app must not scrape NSE web pages or bypass anti-bot controls. NSE publishes real-time data subscription options for different data levels and market segments, and its data usage/sharing policy governs online streaming, real-time, snapshot, delayed, end-of-day, historical, and corporate data usage.

## 2. Goals

- Provide a responsive dashboard with NSE trading data refreshed every 10 seconds.
- Support equities, indices, futures, and options, starting with NSE cash equities and NIFTY/BANKNIFTY indices.
- Show essential intraday trading metrics in a single view.
- Generate explainable buy/sell/hold suggestions using technical indicators, price action, volume, volatility, and risk rules.
- Allow users to configure watchlists, thresholds, alert rules, and risk preferences.
- Maintain reliable, auditable market-data ingestion with data freshness indicators.

## 3. Non-Goals

- The product will not place trades automatically in the initial release; fake-money simulation and paper trading are allowed for training only.
- The product will not guarantee profit or provide personalized financial advice.
- The product will not scrape NSE website endpoints or redistribute exchange data outside licensed usage.
- The product will not support high-frequency trading or sub-second execution workflows.
- The initial release will not include tax reporting or long-term investment analytics.

## 4. Target Users

### Primary User: Intraday Equity Trader

- Tracks 10-100 NSE symbols during market hours.
- Uses price, volume, VWAP, moving averages, and support/resistance to make trades.
- Wants fast, explainable signals and alerts.

### Secondary User: Options/Index Trader

- Tracks NIFTY/BANKNIFTY spot, futures, options chain, open interest, IV, and PCR.
- Needs directional bias and key levels.

### Admin/Compliance User

- Manages data-source credentials, licensing constraints, audit logs, and user permissions.

## 5. User Problems

- Traders switch between multiple tools for watchlists, charts, market breadth, option chain, and alerts.
- Delayed or stale data can lead to poor intraday decisions.
- Trading signals often lack clear reasoning, risk levels, or confidence.
- Users need a 10-second market pulse without manually refreshing pages.
- Intraday decisions require combining trend, momentum, volatility, volume, and market breadth quickly.

## 6. Success Metrics

- Data freshness: 99% of active-market updates displayed within 12 seconds of source receipt for subscribed instruments.
- Dashboard performance: p95 page interaction latency below 200 ms after initial load.
- Availability: 99.5% uptime during NSE market hours.
- Signal explainability: 100% of suggestions include reason, confidence, entry zone, stop loss, target, and invalidation condition.
- User engagement: 60% of weekly active users create at least one custom watchlist.
- Alert usefulness: at least 30% of alerts are clicked or acknowledged by active users.

## 7. Data Sources and Licensing Requirements

### Preferred Data Sources

1. **NSE Data & Analytics / official NSE real-time market-data subscription**
   - Use licensed real-time data feeds for Level 1, Level 2, Level 3, or tick-by-tick data depending on the subscription.
   - Required for production-grade official NSE market data.

2. **Authorized NSE market-data vendor**
   - Use a vendor that explicitly states authorized NSE real-time data support.
   - Vendor must provide API/websocket/SFTP/feed documentation, uptime guarantees, and redistribution terms.

3. **Broker market-data API**
   - Optional integration for users who authenticate with their broker.
   - Must respect broker API rate limits and exchange data policies.

### Data Governance Requirements

- Store source, timestamp, received timestamp, and displayed timestamp for every tick/snapshot.
- Display a visible stale-data warning when the latest update is older than 15 seconds during active market hours.
- Prevent unlicensed redistribution, export, or public sharing of real-time exchange data.
- Log all data-source outages, vendor failovers, and stale-feed incidents.
- Maintain data entitlements by user, market segment, and instrument type.

## 8. Core Dashboard Requirements

### 8.1 Market Overview

- Show NIFTY 50, NIFTY Bank, NIFTY Midcap, and selected sector indices.
- Display last price, absolute change, percentage change, day high/low, open, previous close, and trend indicator.
- Show market breadth: advances, declines, unchanged, advance/decline ratio.
- Show top gainers, top losers, most active by volume, and most active by turnover.
- Refresh displayed values every 10 seconds.

### 8.2 Watchlist

- Users can create, edit, reorder, and delete watchlists.
- Each watchlist row must show:
  - Symbol and company name
  - Last traded price (LTP)
  - Change and percentage change
  - Open, high, low, previous close
  - Volume and volume versus 20-day average
  - VWAP
  - Bid, ask, bid quantity, ask quantity when available
  - Day range position
  - Signal state: Buy, Sell, Hold, Avoid, or Watch
  - Data freshness timestamp
- Support quick filtering by gainers, losers, high volume, near breakout, near VWAP, and active signals.

### 8.3 Instrument Detail Panel

When a user selects a symbol, show:

- Intraday candlestick chart with 1-minute, 3-minute, 5-minute, 10-minute, 15-minute, and 30-minute intervals.
- Overlay indicators:
  - VWAP
  - EMA 9, EMA 20, EMA 50
  - Supertrend
  - Bollinger Bands
  - Previous day high/low/close
  - Pivot, support, and resistance levels
- Lower indicators:
  - Volume bars
  - RSI
  - MACD
  - ATR
  - Relative volume
- Recent trades or quote-depth panel if licensed data supports it.
- News/corporate-announcement panel if licensed sources are available.

### 8.4 Intraday Suggestion Engine

The dashboard must generate explainable suggestions, not opaque predictions.

#### Suggestion Types

- **Buy:** bullish setup with entry zone and risk plan.
- **Sell:** bearish setup with entry zone and risk plan.
- **Hold:** existing signal remains valid but entry is no longer optimal.
- **Watch:** setup is forming but confirmation is missing.
- **Avoid:** liquidity, volatility, spread, stale data, or conflicting indicator conditions make the symbol unsuitable.

#### Required Signal Output

Each suggestion must include:

- Signal type
- Confidence score from 0-100
- Entry zone
- Stop loss
- Target 1 and Target 2
- Risk/reward ratio
- Position sizing guidance based on user-defined risk per trade
- Signal expiry time
- Invalidation condition
- Plain-language explanation
- Indicators that contributed positively and negatively
- Timestamp of calculation

#### Initial Rule-Based Strategy Requirements

A buy suggestion should be considered when configurable conditions such as the following align:

- Price is above VWAP.
- EMA 9 is above EMA 20.
- RSI is between 50 and 70, avoiding overbought extremes.
- Current volume is above recent average volume for the same time window.
- Price breaks above intraday resistance or consolidates above VWAP.
- Market index and sector trend are supportive.
- Spread and liquidity are within acceptable limits.

A sell suggestion should be considered when configurable conditions such as the following align:

- Price is below VWAP.
- EMA 9 is below EMA 20.
- RSI is between 30 and 50, avoiding oversold extremes.
- Current volume is above recent average volume for the same time window.
- Price breaks below intraday support or rejects VWAP.
- Market index and sector trend are weak.
- Spread and liquidity are within acceptable limits.

An avoid signal should be shown when:

- Data is stale.
- Bid/ask spread is too wide.
- Volume is below the user-defined liquidity threshold.
- Price is highly volatile immediately after major news.
- Risk/reward is below the configured minimum.
- Multiple indicators conflict and confidence is low.

### 8.5 Alerts

- Users can create alerts for price, percentage move, volume spike, VWAP cross, EMA cross, RSI threshold, breakout, breakdown, and signal generation.
- Alerts must support in-app notifications in the initial release.
- Email, SMS, WhatsApp, and push notifications should be planned for later releases.
- Alert history must be searchable and exportable where licensing permits.

### 8.6 Risk Management Panel

- User-configurable capital, max risk per trade, max daily loss, and max concurrent positions.
- Calculate suggested quantity using entry, stop loss, and risk per trade.
- Show risk/reward before presenting a signal as actionable.
- Block actionable wording when risk/reward or liquidity rules fail.
- Show daily signal count, win/loss tracking for simulated trades, and avoided-trade reasons.

### 8.7 Fake-Money Simulation and Training Mode

The dashboard must include a fake-money simulation mode so users can practice intraday trading decisions against live market conditions without placing real orders or risking real capital.

#### Simulation Account

- Every user receives a configurable virtual cash balance, with a default of INR 10,00,000.
- Users can reset simulation capital, but every reset must be captured in simulation history.
- Simulated positions must support long and short intraday practice where legally and technically appropriate for the selected instrument.
- Simulated orders must never be sent to a broker, exchange, or order-management system.
- The UI must clearly label all simulated balances, orders, positions, P&L, and trade history as fake money.

#### Simulated Order Types

- Market order simulation using the latest licensed real-time quote.
- Limit order simulation triggered when real-time traded price reaches the configured limit.
- Stop-loss and target order simulation based on real-time price updates.
- Bracket-style practice orders with entry, stop loss, and target.
- Optional slippage and brokerage/fees configuration for more realistic training.

#### Real-Time Data Testing Behavior

- The simulation engine must evaluate pending simulated orders against the same licensed real-time data stream that powers the dashboard.
- The simulation engine must run at the dashboard refresh cadence of 10 seconds or faster when the data source supports faster events.
- Simulated fills must store source price, source timestamp, received timestamp, simulated fill timestamp, slippage assumption, and fill reason.
- If data is stale for more than 15 seconds during market hours, the simulation engine must pause new simulated fills and display a stale-data warning.
- Users must be able to replay the simulated trade timeline alongside the real-time chart and signal history.

#### Training Analytics

- Show simulated realized P&L, unrealized P&L, win rate, average win, average loss, expectancy, drawdown, risk/reward achieved, and rule-adherence score.
- Compare simulated trades against generated suggestions to show whether the user followed, ignored, or overrode the suggestion.
- Provide an end-of-day training summary with best trades, worst trades, missed setups, avoidable mistakes, and risk-rule violations.
- Allow exporting the user's own simulated trading journal where data-licensing rules permit.

## 9. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | The dashboard shall refresh market data on screen every 10 seconds. | P0 |
| FR-002 | The system shall ingest licensed NSE real-time or snapshot data from an approved source. | P0 |
| FR-003 | The system shall show stale-data warnings when data is older than 15 seconds during market hours. | P0 |
| FR-004 | Users shall be able to create and manage watchlists. | P0 |
| FR-005 | The dashboard shall display LTP, OHLC, volume, VWAP, change, bid/ask, and data timestamp per symbol when available. | P0 |
| FR-006 | The system shall calculate VWAP, EMA, RSI, MACD, ATR, volume spike, relative volume, pivots, support, and resistance. | P0 |
| FR-007 | The system shall generate buy/sell/hold/watch/avoid suggestions with explanations and risk levels. | P0 |
| FR-008 | The system shall allow users to configure risk per trade and minimum risk/reward ratio. | P0 |
| FR-009 | The system shall provide filters for high-volume movers, gainers, losers, breakouts, breakdowns, and active signals. | P1 |
| FR-010 | The system shall support in-app alerts. | P1 |
| FR-011 | The system shall provide option-chain metrics including OI, OI change, IV, PCR, max pain, and Greeks when licensed data supports them. | P1 |
| FR-012 | Admins shall be able to configure data-source credentials and entitlement rules. | P1 |
| FR-013 | Users shall be able to trade with fake money in simulation mode using the real-time market-data stream. | P0 |
| FR-014 | The simulation engine shall pause simulated fills when market data is stale for more than 15 seconds during market hours. | P0 |
| FR-015 | Users shall be able to review simulated positions, orders, trade history, P&L, and training analytics. | P1 |
| FR-016 | Users shall be able to export non-real-time personal simulation analytics where licensing permits. | P2 |

## 10. Non-Functional Requirements

### Performance

- Initial dashboard load should complete within 3 seconds on broadband connections for a 50-symbol watchlist.
- 10-second refresh should update changed UI components without full page reload.
- The backend should support at least 1,000 concurrent users in the first production phase.
- Websocket or server-sent events are preferred for pushing updates; polling may be used as a fallback.

### Reliability

- Detect and report data-feed failures within 20 seconds.
- Retry transient data-source failures with exponential backoff.
- Provide graceful degradation by showing cached latest values with clear stale labels.
- Maintain system health dashboards for ingestion lag, processing lag, websocket fanout, and API errors.

### Security

- Encrypt credentials and API keys at rest.
- Use role-based access control for admin functions.
- Enforce HTTPS for all traffic.
- Maintain audit logs for login, entitlement changes, data-source changes, and alert/signal actions.
- Apply rate limiting to public and authenticated APIs.

### Compliance and Disclaimers

- Display a clear disclaimer that suggestions are informational and not investment advice.
- Include regulatory and exchange-data disclaimers in onboarding and footer.
- Respect NSE/vendor redistribution rules.
- Retain signal and data-access logs according to legal and business requirements.

### Real-Time Simulation Testing Requirements

- Test fake-money simulation against a licensed real-time NSE data feed during live market hours before production release.
- Validate that simulated market orders use the latest available quote at the time of the simulated action, including source and received timestamps.
- Validate limit, stop-loss, and target simulated orders against real-time price movements across at least 25 liquid NSE symbols and 5 low-liquidity symbols.
- Validate that simulated fills pause when the data freshness threshold exceeds 15 seconds and resume only after fresh data is received.
- Compare simulated fills against real-time candles and quote snapshots to ensure fill decisions are reproducible from stored audit data.
- Run an end-to-end training session test for a full NSE trading day, including watchlist updates, generated suggestions, simulated orders, P&L changes, alerts, and end-of-day training summary.

## 11. Suggested Technical Architecture

### Frontend

- Single-page application using React, Next.js, Vue, or Angular.
- Charting library with candlestick, indicators, overlays, and responsive layouts.
- Websocket/SSE client for streaming 10-second updates.
- State management for watchlists, preferences, alerts, and signal snapshots.

### Backend Services

1. **Market Data Ingestion Service**
   - Connects to licensed NSE/vendor/broker data source.
   - Normalizes symbols, ticks, quotes, candles, depth, and option-chain payloads.
   - Adds timestamps and freshness metadata.

2. **Aggregation and Indicator Service**
   - Builds 1-minute and higher-timeframe candles.
   - Calculates indicators incrementally.
   - Stores intraday time-series data.

3. **Suggestion Engine**
   - Runs every 10 seconds or on new market snapshot.
   - Applies configurable rule sets.
   - Calculates confidence, stop loss, targets, and risk/reward.
   - Emits explainable signal objects.

4. **Dashboard API Service**
   - Serves watchlists, market overview, instrument details, alerts, and user preferences.
   - Publishes updates through websocket/SSE channels.

5. **Alert Service**
   - Evaluates alert rules.
   - Sends in-app notifications.
   - Stores alert history.

6. **Simulation and Training Service**
   - Maintains fake-money balances, simulated orders, positions, and P&L.
   - Evaluates simulated orders against licensed real-time quotes and candles.
   - Applies configurable slippage, fees, stale-data pauses, and risk-rule checks.
   - Produces training analytics and end-of-day simulation summaries.

### Data Storage

- Time-series store for ticks, quotes, candles, and indicator snapshots.
- Relational database for users, watchlists, alerts, entitlements, simulation accounts, simulated orders, simulated positions, and configuration.
- Cache layer for latest market snapshots and dashboard fanout.
- Object storage for logs and offline analytics exports if needed.

## 12. Data Model Overview

### Instrument

- symbol
- exchange
- segment
- companyName
- isin
- tickSize
- lotSize
- sector
- active

### MarketSnapshot

- symbol
- ltp
- open
- high
- low
- previousClose
- change
- changePercent
- volume
- turnover
- vwap
- bidPrice
- askPrice
- bidQuantity
- askQuantity
- sourceTimestamp
- receivedTimestamp
- displayedTimestamp

### IndicatorSnapshot

- symbol
- timeframe
- ema9
- ema20
- ema50
- rsi
- macd
- macdSignal
- atr
- supertrend
- relativeVolume
- supportLevels
- resistanceLevels
- calculatedAt

### TradeSuggestion

- symbol
- signalType
- confidence
- entryLow
- entryHigh
- stopLoss
- target1
- target2
- riskReward
- suggestedQuantity
- reasons
- warnings
- invalidationCondition
- expiresAt
- calculatedAt

### SimulationAccount

- userId
- virtualCashBalance
- startingVirtualCapital
- realizedPnl
- unrealizedPnl
- maxDrawdown
- resetCount
- lastResetAt
- createdAt
- updatedAt

### SimulatedOrder

- orderId
- userId
- symbol
- side
- orderType
- quantity
- limitPrice
- stopPrice
- status
- sourcePrice
- sourceTimestamp
- simulatedFillPrice
- simulatedFillTimestamp
- slippageApplied
- feesApplied
- fillReason

### SimulatedPosition

- positionId
- userId
- symbol
- side
- quantity
- averageEntryPrice
- currentPrice
- realizedPnl
- unrealizedPnl
- stopLoss
- target
- openedAt
- closedAt

## 13. UX Requirements

- Use a dense trading-terminal layout with dark and light themes.
- Show green/red changes consistently for gains/losses, with accessibility-safe alternatives.
- Pin market indices at the top of the dashboard.
- Allow watchlist columns to be shown, hidden, resized, and reordered.
- Show an always-visible market status indicator: pre-open, open, closed, post-close, holiday, or feed unavailable.
- Display countdown until next scheduled 10-second refresh when polling mode is active.
- Make every suggestion expandable to show its calculation rationale.
- Provide a prominent disclaimer near signal panels.
- Separate real trading terminology from fake-money simulation terminology with persistent "Simulation Mode" labels and distinct visual treatment.

## 14. MVP Scope

### Included in MVP

- User login.
- One default NSE watchlist and custom watchlists.
- Market overview for major NSE indices.
- 10-second market-data refresh.
- LTP, OHLC, volume, VWAP, percentage change, and data timestamp.
- Candlestick chart with VWAP, EMA, RSI, MACD, and volume.
- Rule-based buy/sell/hold/watch/avoid suggestions.
- Fake-money simulation account with simulated orders, positions, P&L, and training history tested against real-time data.
- Risk panel with entry, stop loss, target, risk/reward, and suggested quantity.
- In-app alerts.
- Data-source admin configuration.
- Stale-data warnings and audit logs.

### Excluded from MVP

- Automated order placement.
- Social trading.
- Historical backtesting UI beyond real-time fake-money simulation.
- Mobile native apps.
- Advanced machine-learning prediction models.
- Multi-exchange support beyond NSE.

## 15. Future Enhancements

- Broker order placement with explicit user confirmation.
- Advanced paper-trading leagues, challenges, and signal performance analytics.
- Backtesting and strategy builder.
- Machine-learning ranking model trained on historical intraday setups.
- Options strategy builder for spreads, straddles, and strangles.
- Multi-exchange support for BSE, MCX, and global markets.
- Native mobile apps with push notifications.
- Voice alerts and natural-language market summaries.

## 16. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Unlicensed NSE data usage | Legal and operational risk | Use only licensed NSE/vendor/broker feeds and enforce entitlements. |
| Stale data interpreted as live | Bad trading decisions | Show freshness timestamps and stale warnings; suppress actionable suggestions and simulated fills when stale. |
| False-positive signals | User losses and trust loss | Use conservative risk filters, explainability, confidence scoring, and disclaimers. |
| Data-feed outage | Dashboard unusable during market hours | Implement feed monitoring, retries, failover options, and incident banners. |
| High update fanout cost | Poor performance at scale | Use caching, websocket channels, symbol subscriptions, and delta updates. |
| Over-reliance on suggestions | Compliance and user harm | Position as decision support; require user judgment and show risk disclaimers. |

## 17. Open Questions

- Which licensed NSE data source or authorized vendor will be used for production?
- Which user geographies and regulatory regimes must be supported?
- Should the first release support only equities, or equities plus index futures/options?
- What is the maximum number of watchlist symbols per user?
- Should broker login be required for entitlement validation?
- What minimum liquidity thresholds should be used by default?
- What default fake-money balance, slippage model, and fee assumptions should be used for training?
- What is the preferred charting library and frontend framework?

## 18. Acceptance Criteria

- During NSE market hours, subscribed symbols update visually every 10 seconds or faster.
- A user can create a watchlist, add symbols, and see core trading metrics.
- Stale data older than 15 seconds is clearly marked and suppresses actionable buy/sell suggestions and new simulated fills.
- Each suggestion includes entry zone, stop loss, targets, confidence, risk/reward, expiry, and explanation.
- A user can place fake-money simulated market, limit, stop-loss, and target orders that are evaluated against real-time market data.
- Simulated order fills, P&L, and training analytics are visible with source timestamps and clear simulation labels.
- Risk settings affect suggested quantity, signal eligibility, and simulation warnings.
- Admin can configure data-source credentials without code changes.
- Audit logs capture data-source status changes, signal generation events, and simulated fill decisions.
- A full-market-session simulation test can be completed on licensed real-time data with reproducible audit records for each simulated order fill.

## 19. Reference Links

- NSE real-time data subscription: https://www.nseindia.com/market-data/real-time-data-subscription
- NSE data usage and sharing policy: https://www.nseindia.com/market-data/nse-data-policy
- NSE real-time analytics products: https://www.nseindia.com/market-data/analytical-products
