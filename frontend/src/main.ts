import {
  initialAlerts,
  initialIndices,
  initialSuggestions,
  initialWatchlist,
  fetchDashboardSnapshot,
  nudgeMarketData,
  simulationState,
  type MarketIndex,
  type MarketStatus,
  type SignalState,
  type TradeSuggestion,
  type WatchlistRow,
} from './data.js';

const REFRESH_SECONDS = 10;
const STALE_THRESHOLD_SECONDS = 15;

let indices = initialIndices;
let watchlist = initialWatchlist;
let suggestions = initialSuggestions;
let alerts = initialAlerts;
let simulation = simulationState;
let countdown = REFRESH_SECONDS;
let marketStatus: MarketStatus = 'open';
const apiBaseUrl = getApiBaseUrl();
let selectedSymbol = 'RELIANCE';
let riskPerTrade = 0.75;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element is missing');
}
const appRoot: HTMLElement = rootElement;

function render() {
  const latestDisplayedAt = maxDate(watchlist.map((row) => row.displayedTimestamp));
  const dataAgeSeconds = Math.max(0, Math.floor((Date.now() - latestDisplayedAt.getTime()) / 1000));
  const isStale = dataAgeSeconds > STALE_THRESHOLD_SECONDS;
  const selectedRow = watchlist.find((row) => row.symbol === selectedSymbol) ?? watchlist[0];
  const riskAdjustedSuggestions = suggestions.map((suggestion) => recomputeQuantity(suggestion, riskPerTrade, simulation.virtualCashBalance));

  appRoot.innerHTML = `
    <main class="app-shell">
      <header class="hero-panel">
        <div>
          <p class="eyebrow">NSE Intraday Terminal · MVP build</p>
          <h1>Real-time trading dashboard</h1>
          <p class="hero-copy">Monitor licensed NSE snapshots, explainable intraday signals, risk controls, in-app alerts, and fake-money training from one dense workstation view.</p>
        </div>
        <div class="status-grid" aria-label="Market and data status">
          ${statusPill('Market', marketStatus, 'green', '●')}
          ${statusPill('Next refresh', `${countdown}s`, 'blue', '◷')}
          ${statusPill('Feed age', isStale ? `${dataAgeSeconds}s stale` : `${dataAgeSeconds}s fresh`, isStale ? 'red' : 'green', '◆')}
          ${statusPill('Simulation', 'fake money', 'purple', '₹')}
        </div>
      </header>

      <section class="compliance-banner" role="note">
        <span class="icon">✓</span>
        <span>Compliance guardrail: production data must come from an authorized NSE Data & Analytics subscription, licensed vendor, or broker API. Demo values are not investment advice and are not exchange data.</span>
      </section>

      <section class="index-strip" aria-label="Pinned market indices">
        ${indices.map(indexCard).join('')}
      </section>

      <section class="dashboard-grid">
        ${watchlistPanel(watchlist, selectedSymbol, isStale)}
        ${chartAndSignalPanel(selectedRow, riskAdjustedSuggestions, isStale)}
        ${riskAndSimulationPanel(isStale)}
        ${alertsAndAdminPanel()}
      </section>
    </main>
  `;

  wireEvents();
}

function wireEvents() {
  document.querySelectorAll<HTMLTableRowElement>('[data-symbol]').forEach((row) => {
    row.addEventListener('click', () => {
      selectedSymbol = row.dataset.symbol ?? selectedSymbol;
      render();
    });
  });

  document.getElementById('risk-slider')?.addEventListener('input', (event) => {
    riskPerTrade = Number((event.target as HTMLInputElement).value);
    render();
  });
}

window.setInterval(() => {
  countdown -= 1;
  if (countdown <= 0) {
    void hydrateDashboardFromApi(false);
    const updated = nudgeMarketData(watchlist, indices);
    watchlist = updated.rows;
    indices = updated.indices;
    countdown = REFRESH_SECONDS;
  }
  render();
}, 1000);

void hydrateDashboardFromApi(true);
render();

function getApiBaseUrl(): string {
  const runtimeConfig = window as Window & { DASHBOARD_API_BASE_URL?: string };
  return runtimeConfig.DASHBOARD_API_BASE_URL ?? 'http://localhost:8000';
}

async function hydrateDashboardFromApi(showAvailabilityAlert: boolean) {
  try {
    const snapshot = await fetchDashboardSnapshot(apiBaseUrl);
    indices = snapshot.indices;
    watchlist = snapshot.watchlist;
    suggestions = snapshot.suggestions;
    alerts = snapshot.alerts;
    simulation = snapshot.simulation;
    marketStatus = snapshot.marketStatus;
    render();
  } catch {
    if (showAvailabilityAlert && !alerts.some((alert) => alert.id === 'api-fallback')) {
      alerts = [
        {
          id: 'api-fallback',
          severity: 'warning',
          label: 'Backend unavailable',
          detail: 'Using bundled demo data until the FastAPI service is reachable on the configured API URL.',
          timestamp: new Date(),
        },
        ...alerts,
      ];
      render();
    }
  }
}

function statusPill(label: string, value: string, tone: string, icon: string) {
  return `<div class="status-pill ${tone}"><span class="icon">${icon}</span><div><span>${label}</span><strong>${value}</strong></div></div>`;
}

function indexCard(index: MarketIndex) {
  const positive = index.change >= 0;
  return `
    <article class="index-card">
      <div class="card-title-row"><span>${index.name}</span><span class="${positive ? 'positive' : 'negative'}">${positive ? '↗' : '↘'}</span></div>
      <strong>${formatNumber(index.ltp)}</strong>
      <span class="${positive ? 'positive' : 'negative'}">${formatSigned(index.change)} (${formatSigned(index.changePercent)}%)</span>
      <small>O ${formatNumber(index.open)} · H ${formatNumber(index.high)} · L ${formatNumber(index.low)}</small>
    </article>
  `;
}

function watchlistPanel(rows: WatchlistRow[], selected: string, isStale: boolean) {
  return `
    <section class="panel watchlist-panel">
      ${panelHeader('▦', 'Default NSE watchlist', 'Core quote, volume, VWAP, bid/ask, freshness, and signal columns')}
      <div class="filter-bar">${['All', 'Gainers', 'Losers', 'Breakouts', 'Active signals'].map((filter) => `<button>${filter}</button>`).join('')}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Symbol</th><th>LTP</th><th>Chg%</th><th>OHLC</th><th>Vol / Rel</th><th>VWAP</th><th>Bid / Ask</th><th>Range</th><th>Signal</th><th>Freshness</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr data-symbol="${row.symbol}" class="${row.symbol === selected ? 'selected-row' : ''}">
                <td><strong>${row.symbol}</strong><small>${row.companyName}</small></td>
                <td>${formatNumber(row.ltp)}</td>
                <td class="${row.changePercent >= 0 ? 'positive' : 'negative'}">${formatSigned(row.changePercent)}%</td>
                <td><small>O ${formatNumber(row.open)} H ${formatNumber(row.high)} L ${formatNumber(row.low)}</small></td>
                <td><span>${formatCompact(row.volume)}</span><small>${row.volumeVsAverage.toFixed(2)}x avg</small></td>
                <td>${formatNumber(row.vwap)}</td>
                <td><small>${formatNumber(row.bid)} / ${formatNumber(row.ask)}<br />${row.bidQuantity} / ${row.askQuantity}</small></td>
                <td>${rangeBar(row.dayRangePosition)}</td>
                <td>${signalBadge(isStale ? 'Avoid' : row.signal)}</td>
                <td><small>${isStale ? 'stale' : formatTime(row.displayedTimestamp)}</small></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

function chartAndSignalPanel(selectedRow: WatchlistRow, suggestions: TradeSuggestion[], isStale: boolean) {
  const selectedSuggestion = suggestions.find((suggestion) => suggestion.symbol === selectedRow.symbol) ?? suggestions[0];
  const rationale = isStale ? ['Displayed data is older than the 15-second freshness threshold; buy/sell wording and simulated fills are suppressed.'] : selectedSuggestion.reasons;
  return `
    <section class="panel chart-panel">
      ${panelHeader('⌁', `${selectedRow.symbol} intraday setup`, 'Candlestick placeholder with VWAP, EMA, RSI, MACD, and volume lanes')}
      <div class="chart-placeholder" aria-label="Intraday technical chart placeholder">
        ${Array.from({ length: 34 }, (_, index) => `<span style="height: ${24 + ((index * 19) % 90)}px"></span>`).join('')}
        <div class="indicator-line vwap">VWAP</div><div class="indicator-line ema">EMA 9/20</div>
      </div>
      <article class="suggestion-card ${isStale ? 'disabled' : ''}">
        <div class="card-title-row"><div><p class="eyebrow">Explainable suggestion</p><h2>${isStale ? 'Actionable signals paused' : `${selectedSuggestion.signalType} ${selectedSuggestion.symbol}`}</h2></div>${signalBadge(isStale ? 'Avoid' : selectedSuggestion.signalType)}</div>
        <div class="metrics-row">
          ${metric('Confidence', `${isStale ? 0 : selectedSuggestion.confidence}%`)}
          ${metric('Entry', `${formatNumber(selectedSuggestion.entryLow)}-${formatNumber(selectedSuggestion.entryHigh)}`)}
          ${metric('Stop', formatNumber(selectedSuggestion.stopLoss))}
          ${metric('Targets', `${formatNumber(selectedSuggestion.target1)} / ${formatNumber(selectedSuggestion.target2)}`)}
          ${metric('R:R', selectedSuggestion.riskReward.toFixed(1))}
          ${metric('Qty', isStale ? 'Paused' : String(selectedSuggestion.suggestedQuantity))}
        </div>
        <details open><summary>Calculation rationale</summary><ul>${rationale.map((reason) => `<li>${reason}</li>`).join('')}</ul><p><strong>Invalidation:</strong> ${selectedSuggestion.invalidationCondition}</p></details>
      </article>
    </section>`;
}

function riskAndSimulationPanel(isStale: boolean) {
  return `
    <section class="panel side-panel">
      ${panelHeader('₹', 'Risk & simulation', 'Fake-money training controls and account analytics')}
      <label class="slider-label">Max risk per trade: <strong>${riskPerTrade.toFixed(2)}%</strong><input id="risk-slider" min="0.25" max="2" step="0.25" type="range" value="${riskPerTrade}" /></label>
      <div class="metrics-grid">
        ${metric('Virtual cash', formatCurrency(simulation.virtualCashBalance))}
        ${metric('Realized P&L', formatCurrency(simulation.realizedPnl), 'positive')}
        ${metric('Unrealized P&L', formatCurrency(simulation.unrealizedPnl), 'negative')}
        ${metric('Open positions', String(simulation.openPositions))}
        ${metric('Win rate', `${simulation.winRate}%`)}
        ${metric('Rule adherence', `${simulation.ruleAdherence}%`)}
      </div>
      <div class="${isStale ? 'pause-card warning' : 'pause-card'}"><span class="icon">!</span><span>${isStale ? 'Simulation fills are paused until fresh licensed data resumes.' : 'Simulation Mode: no orders are sent to a broker, exchange, or OMS.'}</span></div>
    </section>`;
}

function alertsAndAdminPanel() {
  return `
    <section class="panel side-panel">
      ${panelHeader('●', 'Alerts & source admin', 'In-app notifications, source configuration, and audit trail')}
      <div class="alert-list">${alerts.map((alert) => `<article class="alert-card ${alert.severity}"><strong>${alert.label}</strong><span>${alert.detail}</span><small>${formatTime(alert.timestamp)}</small></article>`).join('')}</div>
      <div class="admin-card"><h3>Data source configuration</h3><p>Connect FastAPI to an authorized vendor or broker feed, store credentials securely, and audit entitlement changes before production use.</p><button>Configure source</button></div>
    </section>`;
}

function panelHeader(icon: string, title: string, subtitle: string) {
  return `<div class="panel-header"><div><span class="panel-icon">${icon}</span><h2>${title}</h2></div><p>${subtitle}</p></div>`;
}

function signalBadge(signal: SignalState) {
  return `<span class="signal-badge ${signal.toLowerCase()}">${signal}</span>`;
}

function rangeBar(value: number) {
  return `<div class="range-bar"><span style="width: ${Math.max(5, Math.min(100, value))}%"></span></div>`;
}

function metric(label: string, value: string, tone?: string) {
  return `<div class="metric"><span>${label}</span><strong class="${tone ?? ''}">${value}</strong></div>`;
}

function recomputeQuantity(suggestion: TradeSuggestion, riskPercent: number, capital: number): TradeSuggestion {
  const midpoint = (suggestion.entryLow + suggestion.entryHigh) / 2;
  const perShareRisk = Math.max(0.05, Math.abs(midpoint - suggestion.stopLoss));
  return { ...suggestion, suggestedQuantity: Math.floor((capital * (riskPercent / 100)) / perShareRisk) };
}

function maxDate(dates: Date[]): Date {
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { currency: 'INR', maximumFractionDigits: 0, style: 'currency' }).format(value);
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatTime(value: Date): string {
  return value.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
