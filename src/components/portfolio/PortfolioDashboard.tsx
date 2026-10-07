import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  X,
  Target
} from 'lucide-react';
import { 
  PortfolioHolding, 
  PortfolioSummary, 
  AssetAllocationCategory 
} from '../../types/portfolio';
import { GoalDetails } from '../../types';
import { 
  getPortfolioWithLiveData, 
  executeSimulatedBuy, 
  INITIAL_PORTFOLIO_HOLDINGS
} from '../../services/portfolioService';
import { HoldingCard } from './HoldingCard';
import { HoldingDetailView } from './HoldingDetailView';
import { HoldingsTable } from './HoldingsTable';
import { SimulatedBuyModal } from '../investments/SimulatedBuyModal';
import { SimulatedOrder } from '../../types/market';

interface PortfolioDashboardProps {
  primaryGoal?: GoalDetails;
  onNavigateToSIPs?: () => void;
  onNavigateToGoals?: () => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  primaryGoal,
  onNavigateToSIPs,
  onNavigateToGoals,
}) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(INITIAL_PORTFOLIO_HOLDINGS);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalInvested: 146120,
    currentValue: 168206,
    totalReturn: 22086,
    returnPercent: 15.11,
    dayChange: 278.8,
    dayChangePercent: 0.17,
    dataAsOf: 'Latest available (NSE Delayed)',
    isDelayed: true,
  });
  const [allocation, setAllocation] = useState<AssetAllocationCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detail view state
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);

  // Simulated Buy Modal state
  const [buyStockHolding, setBuyStockHolding] = useState<PortfolioHolding | null>(null);
  const [buySuccessMessage, setBuySuccessMessage] = useState<string | null>(null);

  // Load portfolio data & hydrate with real market data
  const loadPortfolioData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPortfolioWithLiveData(primaryGoal);
      setHoldings(data.holdings);
      setSummary(data.summary);
      setAllocation(data.allocation);
    } catch (err: any) {
      console.error('Failed to load live portfolio data:', err);
      setError('Unable to fetch live market data for some holdings. Displaying cached valuations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, [primaryGoal?.id, primaryGoal?.monthlyContribution]);

  // Find currently selected holding for detail view
  const activeHolding = holdings.find((h) => h.id === selectedHoldingId) || null;

  // Handle simulated buy execution
  const handleOpenBuyModal = (holding: PortfolioHolding) => {
    setBuyStockHolding(holding);
  };

  const handleOrderPlaced = (order: SimulatedOrder) => {
    if (!buyStockHolding) return;
    const updated = executeSimulatedBuy(buyStockHolding.id, order.quantity, order.price);
    setHoldings(updated);
    setBuySuccessMessage(
      `Simulated purchase confirmed: Added ${order.quantity} shares of ${order.name} at ₹${order.price.toFixed(2)}. Position updated!`
    );
    setBuyStockHolding(null);

    // Refresh live calculations
    loadPortfolioData();
  };

  const isTotalPositive = summary.totalReturn >= 0;
  const isDayPositive = summary.dayChange >= 0;

  // If viewing a single holding's detail view
  if (activeHolding) {
    return (
      <>
        <HoldingDetailView
          holding={activeHolding}
          primaryGoal={primaryGoal}
          onBack={() => setSelectedHoldingId(null)}
          onBuyMoreStock={handleOpenBuyModal}
          onNavigateToPauseSaver={onNavigateToSIPs}
        />

        {/* Simulated Buy Modal */}
        {buyStockHolding && (
          <SimulatedBuyModal
            stock={{
              symbol: buyStockHolding.symbol || 'RELIANCE.NS',
              displaySymbol: buyStockHolding.displaySymbol,
              name: buyStockHolding.name,
              exchange: buyStockHolding.exchange || 'NSE',
              price: buyStockHolding.currentPrice,
              change: buyStockHolding.dayChange,
              changePercent: buyStockHolding.dayChangePercent,
              currency: 'INR',
              timestamp: Date.now(),
              previousClose: buyStockHolding.currentPrice - buyStockHolding.dayChange,
              open: buyStockHolding.currentPrice,
              dayHigh: buyStockHolding.fiftyTwoWeekHigh || buyStockHolding.currentPrice,
              dayLow: buyStockHolding.fiftyTwoWeekLow || buyStockHolding.currentPrice,
              volume: 0,
              fiftyTwoWeekHigh: buyStockHolding.fiftyTwoWeekHigh || buyStockHolding.currentPrice,
              fiftyTwoWeekLow: buyStockHolding.fiftyTwoWeekLow || buyStockHolding.currentPrice,
              sparkline: [buyStockHolding.averageBuyPrice || 0, buyStockHolding.currentPrice],
              dataFreshness: buyStockHolding.dataFreshness,
              isDelayed: buyStockHolding.isDelayed,
            }}
            isOpen={Boolean(buyStockHolding)}
            onClose={() => setBuyStockHolding(null)}
            onOrderPlaced={handleOrderPlaced}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-7 animate-fade-in text-left">
      {/* 1. Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-fintech-teal mb-1">
            <PieChart className="w-4 h-4 stroke-[2.2]" />
            <span className="text-[11.5px] font-bold uppercase tracking-wider">
              Asset Allocation & Holdings
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-fintech-navy tracking-tight leading-tight">
            Your Portfolio
          </h1>
          <p className="text-[13.5px] text-fintech-slate mt-0.5 max-w-xl">
            Track your investments, performance and progress toward your goals.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {primaryGoal && onNavigateToGoals && (
            <button
              type="button"
              onClick={onNavigateToGoals}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              title="View primary goal details"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Goal: {primaryGoal.name}</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DCE5EE] text-[12px] text-fintech-slate shadow-subtle">
            <Clock className="w-3.5 h-3.5 text-fintech-teal" />
            <span className="font-semibold text-fintech-navy">{summary.dataAsOf}</span>
          </div>

          <button
            type="button"
            onClick={loadPortfolioData}
            disabled={isLoading}
            className="p-2 rounded-full bg-white border border-[#DCE5EE] text-fintech-slate hover:text-fintech-navy hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-subtle disabled:opacity-50"
            title="Refresh portfolio data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-fintech-teal' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulated Buy Success Toast */}
      {buySuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[16px] p-4 flex items-center justify-between text-[13px] text-emerald-900 animate-fade-in shadow-subtle">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{buySuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setBuySuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice / Warning if any */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 flex items-center justify-between text-[12.5px] text-amber-900 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadPortfolioData}
            className="text-amber-800 underline font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Top Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invested */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-slate block">
            Total Invested
          </span>
          <span className="text-[26px] font-extrabold text-fintech-navy tracking-tight block">
            ₹{summary.totalInvested.toLocaleString('en-IN')}
          </span>
          <span className="text-[12px] text-fintech-slate block font-medium">
            Across 3 holdings + cash reserves
          </span>
        </div>

        {/* Card 2: Current Value */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-slate block">
            Current Value
          </span>
          <span className="text-[26px] font-extrabold text-fintech-navy tracking-tight block">
            ₹{summary.currentValue.toLocaleString('en-IN')}
          </span>
          <span className="text-[12px] text-fintech-teal font-semibold block">
            Real market valuations
          </span>
        </div>

        {/* Card 3: Total Returns */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-slate block">
            Total Returns
          </span>
          <div className={`flex items-baseline space-x-1.5 ${isTotalPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            <span className="text-[26px] font-extrabold tracking-tight">
              {isTotalPositive ? '+' : ''}₹{summary.totalReturn.toLocaleString('en-IN')}
            </span>
          </div>
          <span className={`text-[12px] font-bold block ${isTotalPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isTotalPositive ? '+' : ''}{summary.returnPercent.toFixed(2)}% Overall XIRR/Return
          </span>
        </div>

        {/* Card 4: Day Change */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-slate block">
            Today's Change
          </span>
          <div className={`flex items-baseline space-x-1.5 ${isDayPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            <span className="text-[26px] font-extrabold tracking-tight">
              {isDayPositive ? '+' : ''}₹{Math.abs(summary.dayChange).toLocaleString('en-IN')}
            </span>
          </div>
          <span className={`text-[12px] font-bold flex items-center space-x-1 ${isDayPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isDayPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isDayPositive ? '+' : ''}{summary.dayChangePercent.toFixed(2)}% today</span>
          </span>
        </div>
      </div>

      {/* 3. Portfolio Allocation Section */}
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 sm:p-7 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EDF2F7]">
          <div>
            <h2 className="text-[18px] font-bold text-fintech-navy tracking-tight">
              Portfolio Asset Allocation
            </h2>
            <p className="text-[12.5px] text-fintech-slate mt-0.5">
              Balanced across long-term compounding funds, bluechip equities and liquid reserves
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[12px] font-semibold">
            <span className="flex items-center space-x-1.5 text-fintech-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-fintech-teal"></span>
              <span>Mutual Funds ({allocation[0]?.percentage || 57}%)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-fintech-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Direct Stocks ({allocation[1]?.percentage || 30}%)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-fintech-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Liquid/Cash ({allocation[2]?.percentage || 13}%)</span>
            </span>
          </div>
        </div>

        {/* Clean Segmented Horizontal Bar */}
        <div className="h-4 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex shadow-inner">
          <div 
            className="h-full bg-fintech-teal transition-all duration-500 hover:brightness-110" 
            style={{ width: `${allocation[0]?.percentage || 57.4}%` }}
            title={`Mutual Funds: ${allocation[0]?.percentage || 57.4}%`}
          />
          <div 
            className="h-full bg-sky-500 transition-all duration-500 hover:brightness-110" 
            style={{ width: `${allocation[1]?.percentage || 29.6}%` }}
            title={`Direct Stocks: ${allocation[1]?.percentage || 29.6}%`}
          />
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 hover:brightness-110" 
            style={{ width: `${allocation[2]?.percentage || 13.0}%` }}
            title={`Liquid Reserves: ${allocation[2]?.percentage || 13.0}%`}
          />
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Category 1: Mutual Funds */}
          <div className="p-4.5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">Equity Mutual Funds</span>
              <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-full bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20">
                {allocation[0]?.percentage || 57.4}%
              </span>
            </div>
            <div className="space-y-1 text-[12px] pt-1">
              <div className="flex justify-between">
                <span className="text-fintech-slate">Current Value:</span>
                <span className="font-bold text-fintech-navy">₹{(allocation[0]?.currentValue || 96512).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Invested:</span>
                <span className="font-semibold text-fintech-navy">₹{(allocation[0]?.invested || 80000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Return:</span>
                <span className="font-bold text-emerald-700">
                  +₹{(allocation[0]?.returnAmount || 16512).toLocaleString('en-IN')} (+{allocation[0]?.returnPercent || 20.64}%)
                </span>
              </div>
            </div>
          </div>

          {/* Category 2: Direct Stocks */}
          <div className="p-4.5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">Direct Stocks</span>
              <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {allocation[1]?.percentage || 29.6}%
              </span>
            </div>
            <div className="space-y-1 text-[12px] pt-1">
              <div className="flex justify-between">
                <span className="text-fintech-slate">Current Value:</span>
                <span className="font-bold text-fintech-navy">₹{(allocation[1]?.currentValue || 49786).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Invested:</span>
                <span className="font-semibold text-fintech-navy">₹{(allocation[1]?.invested || 46120).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Return:</span>
                <span className="font-bold text-emerald-700">
                  +₹{(allocation[1]?.returnAmount || 3666).toLocaleString('en-IN')} (+{allocation[1]?.returnPercent || 7.95}%)
                </span>
              </div>
            </div>
          </div>

          {/* Category 3: Liquid & Cash */}
          <div className="p-4.5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">Liquid / Cash</span>
              <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {allocation[2]?.percentage || 13.0}%
              </span>
            </div>
            <div className="space-y-1 text-[12px] pt-1">
              <div className="flex justify-between">
                <span className="text-fintech-slate">Current Value:</span>
                <span className="font-bold text-fintech-navy">₹{(allocation[2]?.currentValue || 21908).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Invested:</span>
                <span className="font-semibold text-fintech-navy">₹{(allocation[2]?.invested || 20000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintech-slate">Return:</span>
                <span className="font-bold text-emerald-700">
                  +₹{(allocation[2]?.returnAmount || 1908).toLocaleString('en-IN')} (+{allocation[2]?.returnPercent || 9.54}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. My Investments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight">
              My Investments
            </h2>
            <p className="text-[13px] text-fintech-slate mt-0.5">
              Holdings tracked in real-time with automatic goal-linking & Pause Saver protection
            </p>
          </div>

          <span className="text-[12px] font-semibold text-fintech-slate">
            {holdings.length} Active Holdings
          </span>
        </div>

        {/* 3 Prominent Holding Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {holdings.map((holding) => (
            <HoldingCard
              key={holding.id}
              holding={holding}
              primaryGoal={primaryGoal}
              onViewDetails={(h) => setSelectedHoldingId(h.id)}
              onNavigateToPauseSaver={onNavigateToSIPs}
            />
          ))}
        </div>
      </div>

      {/* 5. All Holdings Table */}
      <HoldingsTable
        holdings={holdings}
        primaryGoal={primaryGoal}
        onViewDetails={(h) => setSelectedHoldingId(h.id)}
      />

      {/* Simulated Buy Modal */}
      {buyStockHolding && (
        <SimulatedBuyModal
          stock={{
            symbol: buyStockHolding.symbol || 'RELIANCE.NS',
            displaySymbol: buyStockHolding.displaySymbol,
            name: buyStockHolding.name,
            exchange: buyStockHolding.exchange || 'NSE',
            price: buyStockHolding.currentPrice,
            change: buyStockHolding.dayChange,
            changePercent: buyStockHolding.dayChangePercent,
            currency: 'INR',
            timestamp: Date.now(),
            previousClose: buyStockHolding.currentPrice - buyStockHolding.dayChange,
            open: buyStockHolding.currentPrice,
            dayHigh: buyStockHolding.fiftyTwoWeekHigh || buyStockHolding.currentPrice,
            dayLow: buyStockHolding.fiftyTwoWeekLow || buyStockHolding.currentPrice,
            volume: 0,
            fiftyTwoWeekHigh: buyStockHolding.fiftyTwoWeekHigh || buyStockHolding.currentPrice,
            fiftyTwoWeekLow: buyStockHolding.fiftyTwoWeekLow || buyStockHolding.currentPrice,
            sparkline: [buyStockHolding.averageBuyPrice || 0, buyStockHolding.currentPrice],
            dataFreshness: buyStockHolding.dataFreshness,
            isDelayed: buyStockHolding.isDelayed,
          }}
          isOpen={Boolean(buyStockHolding)}
          onClose={() => setBuyStockHolding(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
};
