import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  AlertCircle, 
  RefreshCw, 
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { StockQuote, HistoricalPoint, Timeframe } from '../../types/market';
import { getHistoricalPrices } from '../../services/marketData';
import { SimulatedBuyModal } from './SimulatedBuyModal';

interface StockDetailViewProps {
  stock: StockQuote;
  onBack: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

const StockChartTooltip: React.FC<any> = ({ active, payload }) => {
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
        {data.volume > 0 && (
          <div className="text-[10.5px] text-slate-400 mt-0.5">
            Volume: {data.volume.toLocaleString('en-IN')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  stock: initialStock,
  onBack,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [stock, setStock] = useState<StockQuote>(initialStock);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [historyPoints, setHistoryPoints] = useState<HistoricalPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);

  // Load real historical data whenever stock or timeframe changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchHistory() {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const { points, quote } = await getHistoricalPrices(stock.symbol, timeframe);
        if (!isCancelled) {
          setHistoryPoints(points);
          setStock(quote); // sync latest quote if newer
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load historical prices:', err);
          setHistoryError(err?.message || 'Unable to load historical price chart.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      }
    }

    fetchHistory();
    return () => {
      isCancelled = true;
    };
  }, [stock.symbol, timeframe]);

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive ? '#059669' : '#E11D48'; // emerald-600 vs rose-600
  const fillColor = isPositive ? '#10B981' : '#F43F5E';

  // Calculate dynamic chart bounds
  const prices = historyPoints.map((p) => p.close).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : stock.price * 0.95;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : stock.price * 1.05;
  const priceRange = maxPrice - minPrice || 1;
  const yDomainMin = Math.max(0, Number((minPrice - priceRange * 0.08).toFixed(1)));
  const yDomainMax = Number((maxPrice + priceRange * 0.08).toFixed(1));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Navigation Row: Back button */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-[13.5px] font-semibold text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer py-1.5 px-2.5 -ml-2 rounded-[10px] hover:bg-[#F0F5FA]"
        >
          <ArrowLeft className="w-4 h-4 text-fintech-navy stroke-[2.2]" />
          <span>Back to Investments</span>
        </button>

        {/* Watchlist toggle */}
        <button
          type="button"
          onClick={() => onToggleWatchlist(stock.symbol)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] border text-[12px] font-bold transition-all cursor-pointer ${
            isWatchlisted
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-white text-fintech-slate border-[#DCE5EE] hover:bg-[#F8FAFC]'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Hero Stock Header Card */}
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-fintech-navy tracking-tight leading-tight">
              {stock.name}
            </h2>
          </div>

          <div className="flex items-center space-x-2.5 text-[13px] text-fintech-slate">
            <span className="font-bold text-fintech-navy">{stock.displaySymbol}</span>
            <span>•</span>
            <span className="font-semibold">{stock.exchange} Equity</span>
            <span>•</span>
            <span className="bg-[#F0F5FA] text-fintech-navy font-semibold px-2.5 py-0.5 rounded-full border border-[#DCE5EE] text-[11.5px]">
              Market data: {stock.isDelayed ? 'Delayed (15 min)' : 'Latest available'}
            </span>
          </div>

          <div className="text-[11.5px] text-fintech-slate mt-2 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-fintech-teal" />
            <span>{stock.dataFreshness}</span>
          </div>
        </div>

        {/* Price & Change Column */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-[32px] sm:text-[36px] font-extrabold text-fintech-navy tracking-tight">
            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className={`inline-flex items-center space-x-1 text-[14px] font-bold mt-0.5 ${
              isPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}₹{stock.change.toFixed(2)} ({isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Historical Chart Card */}
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 sm:p-8 shadow-card space-y-6">
        {/* Chart Header: Title & Timeframe Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#EDF2F7]">
          <div>
            <h3 className="text-[17px] font-bold text-fintech-navy">Historical Price Chart</h3>
            <p className="text-[12px] text-fintech-slate mt-0.5">
              Real historical OHLC market data plotted for {stock.displaySymbol}
            </p>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center bg-[#F0F5FA] p-1 rounded-[12px] border border-[#DCE5EE] text-[12px]">
            {TIMEFRAMES.map((tf) => {
              const isSelected = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-[8px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-fintech-teal shadow-subtle'
                      : 'text-fintech-slate hover:text-fintech-navy'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* The Recharts Graphic Container */}
        <div className="w-full h-[360px] sm:h-[400px] relative">
          {isLoadingHistory ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] animate-pulse">
              <RefreshCw className="w-6 h-6 text-fintech-teal animate-spin" />
              <span className="text-[13px] font-semibold text-fintech-slate">
                Loading real historical market data for {timeframe}...
              </span>
            </div>
          ) : historyError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <div>
                <p className="text-[14px] font-bold text-fintech-navy">Market data unavailable</p>
                <p className="text-[12px] text-fintech-slate mt-1 max-w-md">{historyError}</p>
              </div>
              <button
                type="button"
                onClick={() => setTimeframe(timeframe)}
                className="px-4 py-1.5 rounded-[10px] bg-fintech-teal text-white font-semibold text-[12px]"
              >
                Retry
              </button>
            </div>
          ) : historyPoints.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-fintech-slate text-[13px] bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
              No historical market data available for this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={fillColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="datetime"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  minTickGap={35}
                />
                <YAxis
                  domain={[yDomainMin, yDomainMax]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `₹${val.toFixed(0)}`}
                  orientation="right"
                />
                <Tooltip content={<StockChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={strokeColor}
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#colorStock)"
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Compact Key Stock Information Row */}
        <div className="pt-4 border-t border-[#EDF2F7]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-fintech-slate block mb-3">
            Key Stock Information
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">Open</span>
              <span className="text-[13.5px] font-bold text-fintech-navy block mt-0.5">
                ₹{stock.open.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">High</span>
              <span className="text-[13.5px] font-bold text-emerald-700 block mt-0.5">
                ₹{stock.dayHigh.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">Low</span>
              <span className="text-[13.5px] font-bold text-rose-600 block mt-0.5">
                ₹{stock.dayLow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">Prev Close</span>
              <span className="text-[13.5px] font-bold text-fintech-navy block mt-0.5">
                ₹{stock.previousClose.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">Volume</span>
              <span className="text-[13.5px] font-bold text-fintech-navy block mt-0.5">
                {stock.volume > 0 ? (stock.volume / 1000000).toFixed(2) + 'M' : '—'}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">52W High</span>
              <span className="text-[13.5px] font-bold text-fintech-navy block mt-0.5">
                ₹{stock.fiftyTwoWeekHigh.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
              <span className="text-[10.5px] text-fintech-slate block font-medium">52W Low</span>
              <span className="text-[13.5px] font-bold text-fintech-navy block mt-0.5">
                ₹{stock.fiftyTwoWeekLow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Buy CTA Section */}
        <div className="pt-6 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-[12px] text-fintech-slate leading-relaxed">
            <div className="flex items-center space-x-1.5 text-fintech-navy font-semibold">
              <Layers className="w-3.5 h-3.5 text-fintech-teal" />
              <span>Simulated Execution Flow</span>
            </div>
            <span>Market data is for informational purposes. This prototype does not execute real trades.</span>
          </div>

          <button
            type="button"
            onClick={() => setIsBuyModalOpen(true)}
            className="w-full sm:w-auto h-[48px] px-8 rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-bold text-[15px] transition-all flex items-center justify-center space-x-2 shadow-subtle cursor-pointer active:scale-[0.99] shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy {stock.name}</span>
          </button>
        </div>
      </div>

      {/* Simulated Buy Order Modal */}
      <SimulatedBuyModal
        stock={stock}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
};
