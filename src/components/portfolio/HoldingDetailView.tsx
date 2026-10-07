import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  ShieldCheck, 
  Target, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Repeat
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { PortfolioHolding, MutualFundNavPoint } from '../../types/portfolio';
import { HistoricalPoint, Timeframe } from '../../types/market';
import { GoalDetails } from '../../types';
import { getHistoricalPrices } from '../../services/marketData';
import { fetchMutualFundHistory } from '../../services/portfolioService';

interface HoldingDetailViewProps {
  holding: PortfolioHolding;
  primaryGoal?: GoalDetails;
  onBack: () => void;
  onBuyMoreStock?: (holding: PortfolioHolding) => void;
  onNavigateToPauseSaver?: () => void;
}

const STOCK_TIMEFRAMES: Timeframe[] = ['1M', '3M', '6M', '1Y', '5Y'];
const MF_TIMEFRAMES: Timeframe[] = ['1M', '3M', '6M', '1Y', '5Y'];

export const HoldingDetailView: React.FC<HoldingDetailViewProps> = ({
  holding,
  primaryGoal,
  onBack,
  onBuyMoreStock,
  onNavigateToPauseSaver,
}) => {
  const isMF = holding.type === 'mutual_fund';
  const isLinkedToPrimary = primaryGoal && (holding.linkedGoalId === primaryGoal.id || (isMF && primaryGoal.isPrimary));
  const activeGoalName = isLinkedToPrimary ? primaryGoal.name : holding.linkedGoalName;

  // Chart States
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [mfDisplayMode, setMfDisplayMode] = useState<'nav' | 'value'>('nav');
  const [stockHistory, setStockHistory] = useState<HistoricalPoint[]>([]);
  const [mfHistory, setMfHistory] = useState<MutualFundNavPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Load actual historical data
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        if (!isMF && holding.symbol) {
          const { points } = await getHistoricalPrices(holding.symbol, timeframe);
          if (!isCancelled) {
            setStockHistory(points);
          }
        } else if (isMF && holding.schemeCode) {
          const points = await fetchMutualFundHistory(
            holding.schemeCode, 
            timeframe, 
            holding.units || 1084.44
          );
          if (!isCancelled) {
            setMfHistory(points);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load historical data:', err);
          setHistoryError(err?.message || 'Historical market data unavailable for this instrument.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [holding.id, holding.symbol, holding.schemeCode, timeframe, isMF]);

  // Derived metrics
  const isPositive = holding.totalReturn >= 0;
  const isDayPositive = holding.dayChange >= 0;

  // Chart data calculations
  const stockPrices = stockHistory.map((p) => p.close).filter(Boolean);
  const minStockPrice = stockPrices.length > 0 ? Math.min(...stockPrices) : holding.currentPrice * 0.95;
  const maxStockPrice = stockPrices.length > 0 ? Math.max(...stockPrices) : holding.currentPrice * 1.05;
  const avgBuyPrice = holding.averageBuyPrice || 0;
  
  // Include average buy price in Y-domain so reference line is always visible
  const effectiveMin = Math.min(minStockPrice, avgBuyPrice > 0 ? avgBuyPrice * 0.98 : minStockPrice);
  const effectiveMax = Math.max(maxStockPrice, avgBuyPrice > 0 ? avgBuyPrice * 1.02 : maxStockPrice);
  const stockPriceRange = effectiveMax - effectiveMin || 1;
  const stockYMin = Math.max(0, Number((effectiveMin - stockPriceRange * 0.06).toFixed(1)));
  const stockYMax = Number((effectiveMax + stockPriceRange * 0.06).toFixed(1));

  // MF Chart bounds
  const mfValues = mfHistory.map((p) => mfDisplayMode === 'nav' ? p.nav : p.investmentValue).filter(Boolean);
  const minMfVal = mfValues.length > 0 ? Math.min(...mfValues) : 0;
  const maxMfVal = mfValues.length > 0 ? Math.max(...mfValues) : 100;
  const mfRange = maxMfVal - minMfVal || 1;
  const mfYMin = Math.max(0, Number((minMfVal - mfRange * 0.06).toFixed(1)));
  const mfYMax = Number((maxMfVal + mfRange * 0.06).toFixed(1));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Header / Back row */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-[14px] font-semibold text-fintech-slate hover:text-fintech-navy transition-colors py-1 px-2.5 rounded-[10px] hover:bg-white border border-transparent hover:border-[#DCE5EE] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-fintech-slate border border-[#DCE5EE]">
            {holding.dataFreshness}
          </span>
          {isLinkedToPrimary && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Primary Goal Asset
            </span>
          )}
        </div>
      </div>

      {/* Main Split Grid: LEFT = Summary & Position, RIGHT = Historical Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: Summary & Position (5 Cols on large) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Info Card */}
          <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 shadow-card space-y-5">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isMF 
                    ? 'bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20' 
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  {isMF ? 'Mutual Fund / SIP' : (holding.exchange || 'NSE')}
                </span>
                <span className="text-[12px] text-fintech-slate font-medium">
                  {holding.category}
                </span>
              </div>

              <h1 className="text-[24px] sm:text-[26px] font-extrabold text-fintech-navy tracking-tight leading-tight">
                {holding.name}
              </h1>
              <p className="text-[13px] text-fintech-slate mt-0.5 font-medium">
                {isMF ? 'Direct Plan • Growth Option' : `${holding.displaySymbol} • Equity Shares`}
              </p>
            </div>

            {/* Price & Day Change Callout */}
            <div className="p-4 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-fintech-slate block">
                  {isMF ? 'Current NAV' : 'Current Market Price'}
                </span>
                <span className="text-[26px] font-extrabold text-fintech-navy tracking-tight leading-none mt-1 block">
                  ₹{holding.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-right">
                <span className={`text-[14px] font-bold flex items-center justify-end space-x-1 ${
                  isDayPositive ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {isDayPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isDayPositive ? '+' : ''}₹{Math.abs(holding.dayChange).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
                <span className={`text-[11.5px] font-semibold ${isDayPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ({isDayPositive ? '+' : ''}{holding.dayChangePercent.toFixed(2)}% today)
                </span>
              </div>
            </div>

            {/* Position Box */}
            <div className="space-y-3">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-navy block">
                {isMF ? 'Your Investment Position' : 'Your Stock Holdings'}
              </span>

              <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                {isMF ? (
                  <>
                    <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                      <span className="text-[10px] uppercase font-bold text-fintech-slate block">Units Accumulated</span>
                      <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                        {(holding.units || 1084.44).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                      <span className="text-[10px] uppercase font-bold text-fintech-slate block">Monthly SIP</span>
                      <span className="text-[14px] font-bold text-fintech-teal mt-0.5 block">
                        ₹{(holding.monthlySip || 4000).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                      <span className="text-[10px] uppercase font-bold text-fintech-slate block">Quantity</span>
                      <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                        {holding.quantity || 0} Shares
                      </span>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                      <span className="text-[10px] uppercase font-bold text-fintech-slate block">Avg. Buy Price</span>
                      <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                        ₹{(holding.averageBuyPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}

                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                  <span className="text-[10px] uppercase font-bold text-fintech-slate block">Total Invested</span>
                  <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                    ₹{holding.investedAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                  <span className="text-[10px] uppercase font-bold text-fintech-slate block">Current Value</span>
                  <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                    ₹{holding.currentValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                  <span className="text-[10px] uppercase font-bold text-fintech-slate block">Total Return</span>
                  <span className={`text-[14px] font-bold mt-0.5 block ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}₹{holding.totalReturn.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                  <span className="text-[10px] uppercase font-bold text-fintech-slate block">Return %</span>
                  <span className={`text-[14px] font-bold mt-0.5 block ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{holding.returnPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Extra Stock Stats (52W High / Low) */}
              {!isMF && (holding.fiftyTwoWeekHigh || holding.fiftyTwoWeekLow) && (
                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE] flex justify-between text-[11.5px]">
                  <div>
                    <span className="text-fintech-slate block">52W High:</span>
                    <span className="font-bold text-fintech-navy">₹{(holding.fiftyTwoWeekHigh || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-fintech-slate block">52W Low:</span>
                    <span className="font-bold text-fintech-navy">₹{(holding.fiftyTwoWeekLow || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Extra MF Stats (Next SIP & XIRR) */}
              {isMF && (
                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE] flex justify-between text-[11.5px]">
                  <div>
                    <span className="text-fintech-slate block">Next Scheduled Debit:</span>
                    <span className="font-bold text-fintech-navy">{holding.nextSipDate || '5 Nov 2026'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-fintech-slate block">Portfolio XIRR:</span>
                    <span className="font-bold text-emerald-700">+{holding.xirr || 14.8}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Linked Financial Goal */}
            <div className="p-3.5 bg-[#F0F5FA] rounded-[14px] border border-[#DCE5EE] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Target className="w-4 h-4 text-fintech-teal shrink-0" />
                <div className="min-w-0 text-[12px]">
                  <span className="text-fintech-slate block text-[10.5px] uppercase font-bold">Supporting Goal</span>
                  <span className="font-bold text-fintech-navy truncate block">{activeGoalName}</span>
                </div>
              </div>

              {isLinkedToPrimary && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  Primary Goal
                </span>
              )}
            </div>

            {/* Pause Saver Nudge for Mutual Fund */}
            {isMF && onNavigateToPauseSaver && (
              <div className="p-4 bg-[#EEF8F8] border border-[#CDEAEB] rounded-[14px] space-y-2 text-[12px]">
                <div className="flex items-center space-x-2 text-fintech-teal font-bold">
                  <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
                  <span>Pause Saver™ Active Protection</span>
                </div>
                <p className="text-fintech-navyMuted text-[11.5px] leading-relaxed">
                  Your monthly ₹{(holding.monthlySip || 4000).toLocaleString('en-IN')} commitment is protected against impulsive pausing during temporary market corrections.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToPauseSaver}
                  className="w-full py-2 px-3 rounded-[10px] bg-fintech-teal text-white font-semibold text-[12px] shadow-subtle hover:bg-fintech-tealHover transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Manage SIP & Pause Saver™ Flow</span>
                </button>
              </div>
            )}

            {/* Action Button for Stock: Buy More */}
            {!isMF && onBuyMoreStock && (
              <button
                type="button"
                onClick={() => onBuyMoreStock(holding)}
                className="w-full h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14px] shadow-subtle transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy More {holding.displaySymbol} (Simulated)</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Historical Graph (7 Cols on large) */}
        <div className="lg:col-span-7 bg-white rounded-[22px] border border-[#DCE5EE] p-6 shadow-card space-y-5">
          {/* Header Row: Title & Timeframe Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF2F7]">
            <div>
              <h2 className="text-[17px] font-bold text-fintech-navy tracking-tight">
                {isMF ? 'Historical NAV & Performance' : 'Historical Market Price'}
              </h2>
              <p className="text-[11.5px] text-fintech-slate mt-0.5">
                {isMF 
                  ? 'Real NAV data from Association of Mutual Funds in India' 
                  : 'Real market candles from NSE India'}
              </p>
            </div>

            {/* Timeframe pill selector */}
            <div className="flex items-center bg-[#F0F5FA] p-1 rounded-[10px] border border-[#DCE5EE] self-start sm:self-auto">
              {(isMF ? MF_TIMEFRAMES : STOCK_TIMEFRAMES).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-[7px] text-[11.5px] font-bold transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-fintech-teal shadow-subtle'
                      : 'text-fintech-slate hover:text-fintech-navy'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* MF Mode Toggle (NAV vs Value) */}
          {isMF && (
            <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-[10px] border border-[#DCE5EE] text-[12px]">
              <span className="text-fintech-slate font-medium pl-1">Display metric:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setMfDisplayMode('nav')}
                  className={`px-3 py-1 rounded-[7px] font-semibold text-[11.5px] transition-all cursor-pointer ${
                    mfDisplayMode === 'nav'
                      ? 'bg-white text-fintech-teal shadow-subtle border border-[#DCE5EE]'
                      : 'text-fintech-slate hover:text-fintech-navy'
                  }`}
                >
                  NAV (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setMfDisplayMode('value')}
                  className={`px-3 py-1 rounded-[7px] font-semibold text-[11.5px] transition-all cursor-pointer ${
                    mfDisplayMode === 'value'
                      ? 'bg-white text-fintech-teal shadow-subtle border border-[#DCE5EE]'
                      : 'text-fintech-slate hover:text-fintech-navy'
                  }`}
                >
                  Portfolio Value (₹)
                </button>
              </div>
            </div>
          )}

          {/* Reference Line Legend for Stocks (Average Buy Price) */}
          {!isMF && avgBuyPrice > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] rounded-[10px] border border-[#DCE5EE] text-[11.5px]">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-600 inline-block"></span>
                <span className="text-fintech-slate font-medium">Your Avg Buy Price:</span>
                <span className="font-bold text-amber-800">₹{avgBuyPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span>
                <span className="text-fintech-slate font-medium">Current Price:</span>
                <span className="font-bold text-fintech-navy">₹{holding.currentPrice.toFixed(2)}</span>
                <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  +{((holding.currentPrice - avgBuyPrice) / avgBuyPrice * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Chart Rendering Area */}
          <div className="h-[340px] w-full relative">
            {isLoadingHistory && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-2 z-10">
                <RefreshCw className="w-6 h-6 text-fintech-teal animate-spin" />
                <span className="text-[12.5px] text-fintech-slate font-medium">
                  Loading real historical data...
                </span>
              </div>
            )}

            {historyError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <span className="text-[13.5px] font-bold text-fintech-navy">
                  Historical Data Unavailable
                </span>
                <p className="text-[12px] text-fintech-slate max-w-sm">
                  {historyError}
                </p>
                <button
                  type="button"
                  onClick={() => setTimeframe('1M')}
                  className="px-3 py-1 rounded-[8px] bg-fintech-teal text-white text-[12px] font-semibold mt-2 cursor-pointer"
                >
                  Try 1M Timeframe
                </button>
              </div>
            ) : !isMF ? (
              /* STOCK CHART */
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stockHistory}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="stockDetailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#007A82' : '#E11D48'} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={isPositive ? '#007A82' : '#E11D48'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="datetime"
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={45}
                  />
                  <YAxis
                    domain={[stockYMin, stockYMax]}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `₹${Math.round(val)}`}
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data: HistoricalPoint = payload[0].payload;
                        return (
                          <div className="bg-[#0C2340] text-white p-3 rounded-[12px] shadow-xl border border-[#1A3A5E] text-left text-[12px] pointer-events-none">
                            <div className="text-slate-300 text-[11px] font-medium mb-1 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-fintech-teal" />
                              <span>{data.datetime}</span>
                            </div>
                            <div className="text-[16px] font-extrabold text-white">
                              ₹{data.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {avgBuyPrice > 0 && (
                              <div className="text-[11px] text-amber-300 mt-0.5">
                                Avg Buy: ₹{avgBuyPrice.toFixed(2)} ({data.close >= avgBuyPrice ? '+' : ''}{((data.close - avgBuyPrice) / avgBuyPrice * 100).toFixed(1)}%)
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Horizontal Average Buy Price Reference Line */}
                  {avgBuyPrice > 0 && (
                    <ReferenceLine
                      y={avgBuyPrice}
                      stroke="#D97706"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Avg Buy: ₹${avgBuyPrice}`,
                        fill: '#B45309',
                        fontSize: 10,
                        position: 'insideTopLeft',
                      }}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={isPositive ? '#007A82' : '#E11D48'}
                    strokeWidth={2.2}
                    fill="url(#stockDetailGrad)"
                    activeDot={{ r: 5, fill: isPositive ? '#007A82' : '#E11D48', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              /* MUTUAL FUND CHART */
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mfHistory}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mfDetailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A82" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#007A82" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={45}
                  />
                  <YAxis
                    domain={[mfYMin, mfYMax]}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `₹${Math.round(val).toLocaleString('en-IN')}`}
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data: MutualFundNavPoint = payload[0].payload;
                        return (
                          <div className="bg-[#0C2340] text-white p-3 rounded-[12px] shadow-xl border border-[#1A3A5E] text-left text-[12px] pointer-events-none">
                            <div className="text-slate-300 text-[11px] font-medium mb-1 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-fintech-teal" />
                              <span>{data.date}</span>
                            </div>
                            <div className="text-[16px] font-extrabold text-white">
                              {mfDisplayMode === 'nav' 
                                ? `₹${data.nav.toFixed(2)} NAV` 
                                : `₹${data.investmentValue.toLocaleString('en-IN')} Value`}
                            </div>
                            <div className="text-[11px] text-slate-300 mt-0.5">
                              {mfDisplayMode === 'nav'
                                ? `Investment Value: ₹${data.investmentValue.toLocaleString('en-IN')}`
                                : `Scheme NAV: ₹${data.nav.toFixed(2)}`}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={mfDisplayMode === 'nav' ? 'nav' : 'investmentValue'}
                    stroke="#007A82"
                    strokeWidth={2.2}
                    fill="url(#mfDetailGrad)"
                    activeDot={{ r: 5, fill: '#007A82', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart Footer Subtitle */}
          <div className="flex items-center justify-between text-[11.5px] text-fintech-slate pt-1 border-t border-[#EDF2F7]">
            <span>
              {isMF ? 'NAV historical points from open AMFI repository' : 'Prices reflect adjusted closing prices from NSE India'}
            </span>
            <span className="font-semibold text-fintech-navy">
              {holding.dataFreshness}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
