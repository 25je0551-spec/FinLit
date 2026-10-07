export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export interface StockQuote {
  symbol: string;
  displaySymbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sparkline: number[];
  dataFreshness: string;
  isDelayed?: boolean;
}

export interface HistoricalPoint {
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SimulatedOrder {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: string;
}

export interface CuratedStockDef {
  symbol: string;
  displaySymbol: string;
  name: string;
  exchange: string;
}
