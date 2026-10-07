import { 
  PortfolioHolding, 
  PortfolioSummary, 
  AssetAllocationCategory, 
  MutualFundNavPoint 
} from '../types/portfolio';
import { Timeframe } from '../types/market';
import { GoalDetails } from '../types';
import { getQuote } from './marketData';

const PORTFOLIO_STORAGE_KEY = 'finlit_user_portfolio_holdings';

export const INITIAL_PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'holding-flexi',
    type: 'mutual_fund',
    schemeCode: '122639',
    displaySymbol: 'FLEXICAP',
    name: 'Flexi Cap Fund (Direct)',
    category: 'Equity • Multi Cap • Direct Growth',
    investedAmount: 80000,
    units: 1084.44,
    currentPrice: 88.99,
    currentValue: 96512,
    totalReturn: 16512,
    returnPercent: 20.64,
    dayChange: 254.8,
    dayChangePercent: 0.26,
    monthlySip: 4000,
    nextSipDate: '5 Nov 2026',
    xirr: 14.8,
    linkedGoalId: 'goal-bike',
    linkedGoalName: 'Dream Bike',
    dataFreshness: 'NAV as of Latest Available (EOD)',
    isDelayed: false,
  },
  {
    id: 'holding-reliance',
    type: 'stock',
    symbol: 'RELIANCE.NS',
    displaySymbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    category: 'Equity • Large Cap • Energy & Retail',
    quantity: 12,
    averageBuyPrice: 1210.0,
    investedAmount: 14520,
    currentPrice: 1345.5,
    currentValue: 16146,
    totalReturn: 1626,
    returnPercent: 11.2,
    dayChange: 144.0,
    dayChangePercent: 0.9,
    linkedGoalId: 'goal-education',
    linkedGoalName: 'Higher Education',
    dataFreshness: 'NSE Delayed (15 mins)',
    isDelayed: true,
  },
  {
    id: 'holding-hdfc',
    type: 'stock',
    symbol: 'HDFCBANK.NS',
    displaySymbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    category: 'Equity • Large Cap • Private Banking',
    quantity: 20,
    averageBuyPrice: 1580.0,
    investedAmount: 31600,
    currentPrice: 1682.0,
    currentValue: 33640,
    totalReturn: 2040,
    returnPercent: 6.46,
    dayChange: -120.0,
    dayChangePercent: -0.36,
    linkedGoalId: 'goal-emergency',
    linkedGoalName: 'Emergency Fund',
    dataFreshness: 'NSE Delayed (15 mins)',
    isDelayed: true,
  },
];

export const CASH_RESERVES = {
  name: 'Liquid & Cash Reserves',
  invested: 20000,
  currentValue: 21908,
  returnAmount: 1908,
  returnPercent: 9.54,
};

export function getStoredHoldings(): PortfolioHolding[] {
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_HOLDINGS));
      return INITIAL_PORTFOLIO_HOLDINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PORTFOLIO_HOLDINGS;
  } catch {
    return INITIAL_PORTFOLIO_HOLDINGS;
  }
}

export function saveStoredHoldings(holdings: PortfolioHolding[]): void {
  try {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings));
  } catch (err) {
    console.error('Failed to save portfolio holdings:', err);
  }
}

// Fetch live NAV from Indian Mutual Fund API via proxy
export async function fetchMutualFundNav(schemeCode: string): Promise<{
  latestNav: number;
  navDate: string;
  previousNav: number;
  fundName: string;
  schemeCategory: string;
}> {
  const url = `/api/market/mf?scheme=${encodeURIComponent(schemeCode)}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch mutual fund NAV: HTTP ${resp.status}`);
  }
  const json = await resp.json();
  const data = json.data;
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No NAV data available for this mutual fund scheme');
  }

  const latestNav = parseFloat(data[0].nav);
  const navDate = data[0].date;
  const previousNav = data.length > 1 ? parseFloat(data[1].nav) : latestNav;

  return {
    latestNav: Number(latestNav.toFixed(4)),
    navDate,
    previousNav: Number(previousNav.toFixed(4)),
    fundName: json.meta?.scheme_name || 'Flexi Cap Fund (Direct)',
    schemeCategory: json.meta?.scheme_category || 'Equity Scheme - Flexi Cap Fund',
  };
}

// Fetch historical NAVs for chart
export async function fetchMutualFundHistory(
  schemeCode: string,
  timeframe: Timeframe,
  units = 1084.44
): Promise<MutualFundNavPoint[]> {
  const url = `/api/market/mf?scheme=${encodeURIComponent(schemeCode)}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch mutual fund history: HTTP ${resp.status}`);
  }
  const json = await resp.json();
  const data: Array<{ date: string; nav: string }> = json.data || [];
  if (data.length === 0) {
    throw new Error('No historical NAV points available for this scheme');
  }

  // Determine cutoff date based on timeframe
  const now = new Date();
  let daysCutoff = 30;
  switch (timeframe) {
    case '1D':
    case '1W':
      daysCutoff = 14;
      break;
    case '1M':
      daysCutoff = 30;
      break;
    case '3M':
      daysCutoff = 90;
      break;
    case '6M':
      daysCutoff = 180;
      break;
    case '1Y':
      daysCutoff = 365;
      break;
    case '5Y':
      daysCutoff = 5 * 365;
      break;
  }

  const cutoffDate = new Date(now.getTime() - daysCutoff * 24 * 60 * 60 * 1000);

  // Parse dd-mm-yyyy dates
  const points: MutualFundNavPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const [d, m, y] = item.date.split('-');
    const pointDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));

    if (pointDate < cutoffDate) {
      break; // since data is sorted descending, we can stop once past cutoff
    }

    const nav = parseFloat(item.nav);
    if (!isNaN(nav)) {
      points.push({
        date: pointDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: timeframe === '1Y' || timeframe === '5Y' ? '2-digit' : undefined,
        }),
        nav: Number(nav.toFixed(2)),
        timestamp: pointDate.getTime(),
        investmentValue: Number((nav * units).toFixed(2)),
      });
    }
  }

  // Reverse so oldest point comes first for chronological chart
  return points.reverse();
}

export async function getPortfolioWithLiveData(primaryGoal?: GoalDetails): Promise<{
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  allocation: AssetAllocationCategory[];
}> {
  const baseHoldings = getStoredHoldings();

  // Map and hydrate each holding with live market/NAV data
  const hydratedPromises = baseHoldings.map(async (holding) => {
    try {
      if (holding.type === 'stock' && holding.symbol) {
        const quote = await getQuote(holding.symbol);
        const qty = holding.quantity || 1;
        const avgBuy = holding.averageBuyPrice || quote.price;
        const investedAmount = Number((qty * avgBuy).toFixed(2));
        const currentValue = Number((qty * quote.price).toFixed(2));
        const totalReturn = Number((currentValue - investedAmount).toFixed(2));
        const returnPercent = investedAmount > 0 
          ? Number(((totalReturn / investedAmount) * 100).toFixed(2)) 
          : 0;
        const dayChange = Number((qty * quote.change).toFixed(2));

        return {
          ...holding,
          currentPrice: quote.price,
          currentValue,
          investedAmount,
          totalReturn,
          returnPercent,
          dayChange,
          dayChangePercent: quote.changePercent,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          dataFreshness: quote.dataFreshness,
          isDelayed: quote.isDelayed ?? true,
        };
      }

      if (holding.type === 'mutual_fund' && holding.schemeCode) {
        const mf = await fetchMutualFundNav(holding.schemeCode);
        const units = holding.units || 1084.44;
        const currentValue = Number((units * mf.latestNav).toFixed(2));
        const investedAmount = holding.investedAmount || 80000;
        const totalReturn = Number((currentValue - investedAmount).toFixed(2));
        const returnPercent = investedAmount > 0 
          ? Number(((totalReturn / investedAmount) * 100).toFixed(2)) 
          : 0;
        const navDiff = mf.latestNav - mf.previousNav;
        const dayChange = Number((units * navDiff).toFixed(2));
        const dayChangePercent = mf.previousNav > 0 
          ? Number(((navDiff / mf.previousNav) * 100).toFixed(2)) 
          : 0;

        // If primary goal is present, sync linked SIP parameters
        const isPrimaryConnected = primaryGoal && (primaryGoal.id === holding.linkedGoalId || primaryGoal.isPrimary);
        const activeGoalName = isPrimaryConnected ? primaryGoal.name : holding.linkedGoalName;
        const activeSipAmount = isPrimaryConnected ? (primaryGoal.monthlyContribution || holding.monthlySip || 4000) : (holding.monthlySip || 4000);

        return {
          ...holding,
          name: holding.name || mf.fundName,
          category: holding.category || mf.schemeCategory,
          currentPrice: mf.latestNav,
          currentValue,
          totalReturn,
          returnPercent,
          dayChange,
          dayChangePercent,
          monthlySip: activeSipAmount,
          linkedGoalName: activeGoalName,
          linkedGoalId: isPrimaryConnected ? primaryGoal.id : holding.linkedGoalId,
          dataFreshness: `NAV as of ${mf.navDate} (EOD)`,
          isDelayed: false,
        };
      }

      return holding;
    } catch (err) {
      console.warn(`Failed to hydrate live market data for ${holding.name}:`, err);
      return holding; // fallback to base holding data
    }
  });

  const hydratedHoldings = await Promise.all(hydratedPromises);

  // Compute total aggregates including Cash & Liquid buffer
  const holdingsInvested = hydratedHoldings.reduce((acc, h) => acc + h.investedAmount, 0);
  const holdingsValue = hydratedHoldings.reduce((acc, h) => acc + h.currentValue, 0);
  const holdingsDayChange = hydratedHoldings.reduce((acc, h) => acc + h.dayChange, 0);

  const totalInvested = Number((holdingsInvested + CASH_RESERVES.invested).toFixed(2));
  const currentValue = Number((holdingsValue + CASH_RESERVES.currentValue).toFixed(2));
  const totalReturn = Number((currentValue - totalInvested).toFixed(2));
  const returnPercent = totalInvested > 0 
    ? Number(((totalReturn / totalInvested) * 100).toFixed(2)) 
    : 0;

  const dayChange = Number(holdingsDayChange.toFixed(2));
  const previousPortfolioValue = currentValue - dayChange;
  const dayChangePercent = previousPortfolioValue > 0 
    ? Number(((dayChange / previousPortfolioValue) * 100).toFixed(2)) 
    : 0;

  // Determine latest data freshness timestamp
  const latestFreshness = hydratedHoldings.find((h) => h.type === 'stock')?.dataFreshness 
    || 'Latest available (NSE Delayed)';

  const summary: PortfolioSummary = {
    totalInvested,
    currentValue,
    totalReturn,
    returnPercent,
    dayChange,
    dayChangePercent,
    dataAsOf: latestFreshness,
    isDelayed: true,
  };

  // Asset Allocation breakdown
  const mfHoldings = hydratedHoldings.filter((h) => h.type === 'mutual_fund');
  const stockHoldings = hydratedHoldings.filter((h) => h.type === 'stock');

  const mfValue = mfHoldings.reduce((acc, h) => acc + h.currentValue, 0);
  const mfInvested = mfHoldings.reduce((acc, h) => acc + h.investedAmount, 0);
  const mfReturn = mfValue - mfInvested;

  const stockValue = stockHoldings.reduce((acc, h) => acc + h.currentValue, 0);
  const stockInvested = stockHoldings.reduce((acc, h) => acc + h.investedAmount, 0);
  const stockReturn = stockValue - stockInvested;

  const allocation: AssetAllocationCategory[] = [
    {
      name: 'Equity Mutual Funds',
      type: 'mutual_fund',
      invested: mfInvested,
      currentValue: mfValue,
      percentage: Number(((mfValue / currentValue) * 100).toFixed(1)),
      returnAmount: Number(mfReturn.toFixed(2)),
      returnPercent: mfInvested > 0 ? Number(((mfReturn / mfInvested) * 100).toFixed(2)) : 0,
      color: 'text-fintech-teal',
      barColor: 'bg-fintech-teal',
    },
    {
      name: 'Direct Stocks (NSE)',
      type: 'stock',
      invested: stockInvested,
      currentValue: stockValue,
      percentage: Number(((stockValue / currentValue) * 100).toFixed(1)),
      returnAmount: Number(stockReturn.toFixed(2)),
      returnPercent: stockInvested > 0 ? Number(((stockReturn / stockInvested) * 100).toFixed(2)) : 0,
      color: 'text-sky-600',
      barColor: 'bg-sky-500',
    },
    {
      name: 'Liquid & Cash Reserves',
      type: 'cash',
      invested: CASH_RESERVES.invested,
      currentValue: CASH_RESERVES.currentValue,
      percentage: Number(((CASH_RESERVES.currentValue / currentValue) * 100).toFixed(1)),
      returnAmount: CASH_RESERVES.returnAmount,
      returnPercent: CASH_RESERVES.returnPercent,
      color: 'text-emerald-700',
      barColor: 'bg-emerald-500',
    },
  ];

  return {
    holdings: hydratedHoldings,
    summary,
    allocation,
  };
}

export function executeSimulatedBuy(
  holdingId: string,
  addQuantity: number,
  executionPrice: number
): PortfolioHolding[] {
  const current = getStoredHoldings();
  const updated = current.map((holding) => {
    if (holding.id === holdingId && holding.type === 'stock') {
      const currentQty = holding.quantity || 0;
      const currentInvested = holding.investedAmount || 0;
      const additionalInvested = addQuantity * executionPrice;
      const newQty = currentQty + addQuantity;
      const newInvested = currentInvested + additionalInvested;
      const newAvgBuy = Number((newInvested / newQty).toFixed(2));
      const newCurrentVal = Number((newQty * executionPrice).toFixed(2));
      const newReturn = Number((newCurrentVal - newInvested).toFixed(2));

      return {
        ...holding,
        quantity: newQty,
        investedAmount: newInvested,
        averageBuyPrice: newAvgBuy,
        currentPrice: executionPrice,
        currentValue: newCurrentVal,
        totalReturn: newReturn,
        returnPercent: Number(((newReturn / newInvested) * 100).toFixed(2)),
      };
    }
    return holding;
  });

  saveStoredHoldings(updated);
  return updated;
}
