export type SignalState = 'Buy' | 'Sell' | 'Hold' | 'Avoid' | 'Watch';
export type MarketStatus = 'pre-open' | 'open' | 'closed' | 'post-close' | 'holiday' | 'feed unavailable';

export interface MarketIndex {
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  trend: 'up' | 'down' | 'flat';
}

export interface WatchlistRow {
  symbol: string;
  companyName: string;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  volumeVsAverage: number;
  vwap: number;
  bid: number;
  ask: number;
  bidQuantity: number;
  askQuantity: number;
  dayRangePosition: number;
  signal: SignalState;
  sourceTimestamp: Date;
  receivedTimestamp: Date;
  displayedTimestamp: Date;
}

export interface TradeSuggestion {
  symbol: string;
  signalType: SignalState;
  confidence: number;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  suggestedQuantity: number;
  reasons: string[];
  warnings: string[];
  invalidationCondition: string;
  expiresAt: Date;
  calculatedAt: Date;
}

export interface AlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  label: string;
  detail: string;
  timestamp: Date;
}

export interface SimulationState {
  virtualCashBalance: number;
  startingVirtualCapital: number;
  realizedPnl: number;
  unrealizedPnl: number;
  maxDrawdown: number;
  openPositions: number;
  winRate: number;
  ruleAdherence: number;
}

export const initialIndices: MarketIndex[] = [
  { name: 'NIFTY 50', ltp: 24836.3, change: 126.15, changePercent: 0.51, open: 24728.1, high: 24882.4, low: 24690.8, previousClose: 24710.15, trend: 'up' },
  { name: 'NIFTY Bank', ltp: 53354.9, change: -84.4, changePercent: -0.16, open: 53482.2, high: 53620.7, low: 53280.5, previousClose: 53439.3, trend: 'down' },
  { name: 'NIFTY Midcap', ltp: 57412.7, change: 318.6, changePercent: 0.56, open: 57124.0, high: 57560.2, low: 57088.4, previousClose: 57094.1, trend: 'up' },
  { name: 'NIFTY IT', ltp: 35628.5, change: 24.75, changePercent: 0.07, open: 35580.9, high: 35740.1, low: 35494.4, previousClose: 35603.75, trend: 'flat' },
];

const now = new Date();

export const initialWatchlist: WatchlistRow[] = [
  createWatchlistRow('RELIANCE', 'Reliance Industries', 2918.45, 1.24, 2378000, 2910.2, 'Buy'),
  createWatchlistRow('HDFCBANK', 'HDFC Bank', 1668.25, -0.44, 3892000, 1675.6, 'Sell'),
  createWatchlistRow('INFY', 'Infosys', 1482.8, 0.18, 1288000, 1478.4, 'Hold'),
  createWatchlistRow('TCS', 'Tata Consultancy Services', 3866.1, 0.72, 822000, 3842.5, 'Watch'),
  createWatchlistRow('TATAMOTORS', 'Tata Motors', 965.7, -1.08, 4710000, 974.9, 'Avoid'),
  createWatchlistRow('SBIN', 'State Bank of India', 842.35, 0.95, 5421000, 835.6, 'Buy'),
];

export const initialSuggestions: TradeSuggestion[] = [
  {
    symbol: 'RELIANCE',
    signalType: 'Buy',
    confidence: 78,
    entryLow: 2912,
    entryHigh: 2922,
    stopLoss: 2894,
    target1: 2946,
    target2: 2968,
    riskReward: 2.1,
    suggestedQuantity: 55,
    reasons: ['Price holding above VWAP', 'EMA 9 is above EMA 20', 'Relative volume is 1.4x intraday average'],
    warnings: ['Use only with licensed real-time feed connected'],
    invalidationCondition: 'Avoid fresh entries if price closes below VWAP for two refresh cycles.',
    expiresAt: addMinutes(now, 20),
    calculatedAt: now,
  },
  {
    symbol: 'HDFCBANK',
    signalType: 'Sell',
    confidence: 66,
    entryLow: 1664,
    entryHigh: 1669,
    stopLoss: 1682,
    target1: 1642,
    target2: 1628,
    riskReward: 1.7,
    suggestedQuantity: 62,
    reasons: ['Rejected VWAP after weak opening range', 'RSI slipped below 50', 'Bank index trend is unsupportive'],
    warnings: ['Minimum risk/reward is barely satisfied'],
    invalidationCondition: 'Signal invalid if bid/ask spread widens above configured threshold.',
    expiresAt: addMinutes(now, 15),
    calculatedAt: now,
  },
];

export const initialAlerts: AlertItem[] = [
  { id: 'feed', severity: 'info', label: 'Licensed feed mode', detail: 'Demo snapshots are placeholders until an authorized NSE/vendor/broker data source is configured.', timestamp: now },
  { id: 'risk', severity: 'warning', label: 'Risk guard active', detail: 'Signals below 1.5 risk/reward are downgraded to Watch or Avoid.', timestamp: now },
  { id: 'sim', severity: 'info', label: 'Simulation Mode', detail: 'Fake-money fills pause automatically when displayed market data is stale.', timestamp: now },
];

export const simulationState: SimulationState = {
  virtualCashBalance: 1_000_000,
  startingVirtualCapital: 1_000_000,
  realizedPnl: 12250,
  unrealizedPnl: -3450,
  maxDrawdown: 18500,
  openPositions: 3,
  winRate: 58,
  ruleAdherence: 84,
};

function createWatchlistRow(
  symbol: string,
  companyName: string,
  ltp: number,
  changePercent: number,
  volume: number,
  vwap: number,
  signal: SignalState,
): WatchlistRow {
  const previousClose = ltp / (1 + changePercent / 100);
  const change = ltp - previousClose;
  const high = Math.max(ltp, previousClose) * 1.006;
  const low = Math.min(ltp, previousClose) * 0.994;
  return {
    symbol,
    companyName,
    ltp,
    change,
    changePercent,
    open: previousClose * 1.001,
    high,
    low,
    previousClose,
    volume,
    volumeVsAverage: 0.75 + Math.abs(changePercent) / 2,
    vwap,
    bid: ltp - 0.1,
    ask: ltp + 0.1,
    bidQuantity: Math.round(500 + volume / 9000),
    askQuantity: Math.round(450 + volume / 9200),
    dayRangePosition: ((ltp - low) / (high - low)) * 100,
    signal,
    sourceTimestamp: now,
    receivedTimestamp: now,
    displayedTimestamp: now,
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function nudgeMarketData(rows: WatchlistRow[], indices: MarketIndex[]): { rows: WatchlistRow[]; indices: MarketIndex[] } {
  const timestamp = new Date();
  return {
    rows: rows.map((row, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const nudge = direction * row.ltp * (0.0004 + index * 0.00005);
      const ltp = row.ltp + nudge;
      const high = Math.max(row.high, ltp);
      const low = Math.min(row.low, ltp);
      const change = ltp - row.previousClose;
      return {
        ...row,
        ltp,
        change,
        changePercent: (change / row.previousClose) * 100,
        high,
        low,
        volume: row.volume + Math.round(8500 + index * 650),
        bid: ltp - 0.1,
        ask: ltp + 0.1,
        dayRangePosition: ((ltp - low) / (high - low)) * 100,
        sourceTimestamp: timestamp,
        receivedTimestamp: timestamp,
        displayedTimestamp: timestamp,
      };
    }),
    indices: indices.map((index, itemIndex) => {
      const nudge = (itemIndex % 2 === 0 ? 1 : -1) * index.ltp * 0.00025;
      const ltp = index.ltp + nudge;
      const change = ltp - index.previousClose;
      return {
        ...index,
        ltp,
        change,
        changePercent: (change / index.previousClose) * 100,
        high: Math.max(index.high, ltp),
        low: Math.min(index.low, ltp),
        trend: (change > 5 ? 'up' : change < -5 ? 'down' : 'flat') as MarketIndex['trend'],
      };
    }),
  };
}

export interface DashboardSnapshot {
  marketStatus: MarketStatus;
  refreshIntervalSeconds: number;
  staleThresholdSeconds: number;
  indices: MarketIndex[];
  watchlist: WatchlistRow[];
  suggestions: TradeSuggestion[];
  alerts: AlertItem[];
  simulation: SimulationState;
}

export async function fetchDashboardSnapshot(apiBaseUrl: string): Promise<DashboardSnapshot> {
  const response = await fetch(`${apiBaseUrl}/api/dashboard`, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Dashboard API responded with ${response.status}`);
  }

  const snapshot = (await response.json()) as DashboardSnapshot;
  return {
    ...snapshot,
    watchlist: snapshot.watchlist.map((row) => ({
      ...row,
      sourceTimestamp: new Date(row.sourceTimestamp),
      receivedTimestamp: new Date(row.receivedTimestamp),
      displayedTimestamp: new Date(row.displayedTimestamp),
    })),
    suggestions: snapshot.suggestions.map((suggestion) => ({
      ...suggestion,
      expiresAt: new Date(suggestion.expiresAt),
      calculatedAt: new Date(suggestion.calculatedAt),
    })),
    alerts: snapshot.alerts.map((alert) => ({ ...alert, timestamp: new Date(alert.timestamp) })),
  };
}
