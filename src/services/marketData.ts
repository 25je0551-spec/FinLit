import { StockQuote, HistoricalPoint, Timeframe, CuratedStockDef } from '../types/market';

export const POPULAR_INDIAN_STOCKS: CuratedStockDef[] = [
  { symbol: 'RELIANCE.NS', displaySymbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', displaySymbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', displaySymbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE' },
  { symbol: 'TCS.NS', displaySymbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'INFY.NS', displaySymbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', displaySymbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE' },
  { symbol: 'LT.NS', displaySymbol: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE' },
  { symbol: 'ITC.NS', displaySymbol: 'ITC', name: 'ITC Limited', exchange: 'NSE' },
  { symbol: 'SBIN.NS', displaySymbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'TMCV.NS', displaySymbol: 'TATAMOTORS', name: 'Tata Motors Limited', exchange: 'NSE' },
];

// In-memory quote cache with 45s TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const quoteCache = new Map<string, CacheEntry<StockQuote>>();
const historyCache = new Map<string, CacheEntry<{ points: HistoricalPoint[]; quote: StockQuote }>>();
const CACHE_TTL_MS = 45 * 1000;

function formatTimestamp(epochSeconds: number): string {
  if (!epochSeconds) return 'Latest available (NSE Delayed)';
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

function formatDateForTimeframe(epochSeconds: number, timeframe: Timeframe): string {
  const date = new Date(epochSeconds * 1000);
  if (timeframe === '1D') {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  }
  if (timeframe === '1W') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  }
  if (timeframe === '1M' || timeframe === '3M' || timeframe === '6M') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata',
    });
  }
  if (timeframe === '1Y') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  }
  // 5Y
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function normalizeStockQuote(result: any, curatedDef?: CuratedStockDef): StockQuote {
  const meta = result.meta || {};
  const quoteData = result.indicators?.quote?.[0] || {};
  const symbol = meta.symbol || curatedDef?.symbol || 'UNKNOWN';
  
  const displaySymbol = curatedDef?.displaySymbol || 
    symbol.replace('.NS', '').replace('.BO', '');

  const name = curatedDef?.name || 
    meta.longName || 
    meta.shortName || 
    displaySymbol;

  const price = typeof meta.regularMarketPrice === 'number' 
    ? meta.regularMarketPrice 
    : 0;

  const previousClose = typeof meta.chartPreviousClose === 'number'
    ? meta.chartPreviousClose
    : (typeof meta.previousClose === 'number' ? meta.previousClose : price);

  const change = price - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  // Extract sparkline from valid close prices
  const rawCloses = (quoteData.close || []).filter((c: any) => typeof c === 'number' && !isNaN(c));
  const sparkline = rawCloses.length > 0 ? rawCloses : [previousClose, price];

  const rawOpens = (quoteData.open || []).filter((o: any) => typeof o === 'number' && !isNaN(o));
  const open = rawOpens.length > 0 ? rawOpens[0] : (meta.regularMarketDayHigh || price);

  return {
    symbol,
    displaySymbol,
    name,
    exchange: 'NSE',
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    currency: meta.currency || 'INR',
    timestamp: meta.regularMarketTime || Math.floor(Date.now() / 1000),
    previousClose: Number(previousClose.toFixed(2)),
    open: Number(open.toFixed(2)),
    dayHigh: typeof meta.regularMarketDayHigh === 'number' ? Number(meta.regularMarketDayHigh.toFixed(2)) : price,
    dayLow: typeof meta.regularMarketDayLow === 'number' ? Number(meta.regularMarketDayLow.toFixed(2)) : price,
    volume: meta.regularMarketVolume || 0,
    fiftyTwoWeekHigh: typeof meta.fiftyTwoWeekHigh === 'number' ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : price,
    fiftyTwoWeekLow: typeof meta.fiftyTwoWeekLow === 'number' ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : price,
    sparkline,
    dataFreshness: formatTimestamp(meta.regularMarketTime),
    isDelayed: true,
  };
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const curated = POPULAR_INDIAN_STOCKS.find((s) => s.symbol === symbol);
  const response = await fetch(`/api/market/chart?symbol=${encodeURIComponent(symbol)}&range=5d&interval=1d`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}: HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];
  if (!result) {
    throw new Error(json.chart?.error?.description || `No market data available for ${symbol}`);
  }

  const quote = normalizeStockQuote(result, curated);
  quoteCache.set(symbol, { data: quote, timestamp: Date.now() });
  return quote;
}

export async function getPopularStocks(): Promise<StockQuote[]> {
  const promises = POPULAR_INDIAN_STOCKS.map(async (stock) => {
    try {
      return await getQuote(stock.symbol);
    } catch (err) {
      console.error(`Error loading ${stock.symbol}:`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  const validQuotes = results.filter((q): q is StockQuote => q !== null);

  if (validQuotes.length === 0) {
    throw new Error('Unable to load market data for popular stocks');
  }

  return validQuotes;
}

export async function getHistoricalPrices(
  symbol: string,
  timeframe: Timeframe
): Promise<{ points: HistoricalPoint[]; quote: StockQuote }> {
  const cacheKey = `${symbol}_${timeframe}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let range = '1mo';
  let interval = '1d';

  switch (timeframe) {
    case '1D':
      range = '1d';
      interval = '5m';
      break;
    case '1W':
      range = '5d';
      interval = '15m';
      break;
    case '1M':
      range = '1mo';
      interval = '1d';
      break;
    case '3M':
      range = '3mo';
      interval = '1d';
      break;
    case '6M':
      range = '6mo';
      interval = '1d';
      break;
    case '1Y':
      range = '1y';
      interval = '1d';
      break;
    case '5Y':
      range = '5y';
      interval = '1wk';
      break;
  }

  const url = `/api/market/chart?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load historical data for ${symbol}: HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];
  if (!result || !result.timestamp || result.timestamp.length === 0) {
    throw new Error(`No historical market data available for ${symbol}`);
  }

  const timestamps: number[] = result.timestamp;
  const quoteData = result.indicators?.quote?.[0] || {};
  const opens: number[] = quoteData.open || [];
  const highs: number[] = quoteData.high || [];
  const lows: number[] = quoteData.low || [];
  const closes: number[] = quoteData.close || [];
  const volumes: number[] = quoteData.volume || [];

  const points: HistoricalPoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (typeof close !== 'number' || isNaN(close)) continue;

    const ts = timestamps[i];
    points.push({
      timestamp: ts * 1000,
      datetime: formatDateForTimeframe(ts, timeframe),
      open: typeof opens[i] === 'number' ? Number(opens[i].toFixed(2)) : close,
      high: typeof highs[i] === 'number' ? Number(highs[i].toFixed(2)) : close,
      low: typeof lows[i] === 'number' ? Number(lows[i].toFixed(2)) : close,
      close: Number(close.toFixed(2)),
      volume: typeof volumes[i] === 'number' ? volumes[i] : 0,
    });
  }

  if (points.length === 0) {
    throw new Error(`No historical data points available for ${symbol} (${timeframe})`);
  }

  const curated = POPULAR_INDIAN_STOCKS.find((s) => s.symbol === symbol);
  const quote = normalizeStockQuote(result, curated);

  const payload = { points, quote };
  historyCache.set(cacheKey, { data: payload, timestamp: Date.now() });
  return payload;
}

export async function searchStocks(
  query: string
): Promise<Array<{ symbol: string; displaySymbol: string; name: string; exchange: string }>> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  // Match local curated first
  const localMatches = POPULAR_INDIAN_STOCKS.filter((s) =>
    s.displaySymbol.toLowerCase().includes(cleanQ) ||
    s.name.toLowerCase().includes(cleanQ) ||
    s.symbol.toLowerCase().includes(cleanQ)
  );

  if (localMatches.length >= 4 || cleanQ.length < 2) {
    return localMatches;
  }

  try {
    const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      const quotes = json.quotes || [];
      const remoteMatches = quotes
        .filter((q: any) => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
        .map((q: any) => ({
          symbol: q.symbol,
          displaySymbol: q.symbol.replace('.NS', '').replace('.BO', ''),
          name: q.shortname || q.longname || q.symbol,
          exchange: q.symbol.endsWith('.BO') ? 'BSE' : 'NSE',
        }));

      // Combine with local, deduplicate by symbol
      const seen = new Set<string>();
      const combined: Array<{ symbol: string; displaySymbol: string; name: string; exchange: string }> = [];

      for (const item of [...localMatches, ...remoteMatches]) {
        if (!seen.has(item.symbol)) {
          seen.add(item.symbol);
          combined.push(item);
        }
      }
      return combined.slice(0, 8);
    }
  } catch (err) {
    console.warn('Remote search fallback failed:', err);
  }

  return localMatches;
}

// Watchlist LocalStorage persistence
const WATCHLIST_STORAGE_KEY = 'finlit_watchlist_symbols';
const DEFAULT_WATCHLIST = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'];

export function getWatchlistSymbols(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST));
      return DEFAULT_WATCHLIST;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function toggleWatchlistSymbol(symbol: string): boolean {
  try {
    const current = getWatchlistSymbols();
    const exists = current.includes(symbol);
    const updated = exists ? current.filter((s) => s !== symbol) : [...current, symbol];
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export function isSymbolInWatchlist(symbol: string): boolean {
  return getWatchlistSymbols().includes(symbol);
}
