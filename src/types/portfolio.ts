import { Timeframe } from './market';

export interface PortfolioHolding {
  id: string;
  type: 'mutual_fund' | 'stock';
  symbol?: string;          // e.g. 'RELIANCE.NS', 'HDFCBANK.NS'
  schemeCode?: string;      // e.g. '122639'
  displaySymbol: string;    // e.g. 'FLEXICAP', 'RELIANCE', 'HDFCBANK'
  name: string;             // e.g. 'Flexi Cap Fund (Direct)', 'Reliance Industries Limited'
  category: string;         // e.g. 'Equity • Multi Cap • Direct Growth', 'Equity • Energy & Telecom'
  exchange?: string;        // 'NSE'
  quantity?: number;        // for stocks, e.g. 12, 20
  averageBuyPrice?: number; // for stocks, e.g. 1210, 1580
  units?: number;           // for mutual funds, e.g. 1084.44
  investedAmount: number;   // ₹ amount
  currentPrice: number;     // live stock price or live fund NAV
  currentValue: number;     // quantity * currentPrice or units * NAV
  totalReturn: number;      // currentValue - investedAmount
  returnPercent: number;    // (totalReturn / investedAmount) * 100
  dayChange: number;        // ₹ change today
  dayChangePercent: number; // % change today
  monthlySip?: number;      // ₹ / mo
  nextSipDate?: string;     // e.g. '5 Nov 2026'
  xirr?: number;            // e.g. 14.8
  linkedGoalId: string;     // 'goal-bike', 'goal-education', 'goal-emergency'
  linkedGoalName: string;   // 'Dream Bike', 'Higher Education'
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dataFreshness: string;
  isDelayed?: boolean;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  dataAsOf: string;
  isDelayed: boolean;
}

export interface AssetAllocationCategory {
  name: string;
  type: 'mutual_fund' | 'stock' | 'cash';
  invested: number;
  currentValue: number;
  percentage: number;
  returnAmount: number;
  returnPercent: number;
  color: string;
  barColor: string;
}

export interface MutualFundNavPoint {
  date: string;
  nav: number;
  timestamp: number;
  investmentValue: number;
}

export type HoldingTimeframe = Timeframe;
