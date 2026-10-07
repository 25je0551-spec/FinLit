import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { StockQuote } from '../../types/market';
import { 
  getPopularStocks, 
  getWatchlistSymbols, 
  toggleWatchlistSymbol, 
  getQuote, 
  searchStocks 
} from '../../services/marketData';
import { StockCard } from './StockCard';
import { StockDetailView } from './StockDetailView';
import { MiniSparkline } from './MiniSparkline';

export const InvestmentsMarketplace: React.FC = () => {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);

  // Watchlist state initialized directly from localStorage
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => getWatchlistSymbols());
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; displaySymbol: string; name: string; exchange: string }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Fetch Popular Stocks
  const loadStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPopularStocks();
      setStocks(data);
    } catch (err: any) {
      console.error('Error fetching popular stocks:', err);
      setError(err?.message || 'Unable to load market data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPopularStocks()
      .then((data) => {
        if (isMounted) {
          setStocks(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Unable to load market data.');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Watchlist toggle
  const handleToggleWatchlist = (symbol: string) => {
    toggleWatchlistSymbol(symbol);
    setWatchlistSymbols(getWatchlistSymbols());
  };

  // Filter Watchlist items from loaded stocks
  const watchlistStocks = useMemo(() => {
    return stocks.filter((s) => watchlistSymbols.includes(s.symbol));
  }, [stocks, watchlistSymbols]);

  // Live search handler with debouncing
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStocks(q);
        setSearchResults(results);
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click on search result
  const handleSelectSearchResult = async (symbol: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    
    // Check if stock already loaded in memory
    const existing = stocks.find((s) => s.symbol === symbol);
    if (existing) {
      setSelectedStock(existing);
      return;
    }

    try {
      setIsLoading(true);
      const fetched = await getQuote(symbol);
      setSelectedStock(fetched);
    } catch (err) {
      console.error('Failed to open searched stock:', err);
      setError(`Unable to load market data for ${symbol}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // If a stock is currently selected, render the detailed stock panel
  if (selectedStock) {
    return (
      <StockDetailView
        stock={selectedStock}
        onBack={() => setSelectedStock(null)}
        isWatchlisted={watchlistSymbols.includes(selectedStock.symbol)}
        onToggleWatchlist={handleToggleWatchlist}
      />
    );
  }

  // Common freshness stamp from first available quote
  const freshnessStamp = stocks[0]?.dataFreshness || 'Latest available (NSE Delayed)';

  return (
    <div className="space-y-7 animate-fade-in text-left">
      {/* 1. TOP HEADER & SEARCH ROW */}
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 sm:p-8 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-fintech-teal mb-1">
            <Sparkles className="w-4 h-4 text-fintech-teal stroke-[2.2]" />
            <span className="text-[11.5px] font-bold uppercase tracking-wider">
              FinLit Markets • Live Quote Feed
            </span>
          </div>

          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-fintech-navy tracking-tight">
            Investments
          </h1>
          <p className="text-[13.5px] text-fintech-slate mt-1 max-w-xl leading-relaxed">
            Explore popular Indian equities and see verified historical price movements over time.
          </p>

          {/* Market Status Pill */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <div className="inline-flex items-center space-x-2 bg-[#F0F5FA] border border-[#DCE5EE] px-3 py-1 rounded-full text-[11.5px] font-bold text-fintech-navy">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>NSE / BSE Market Data</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 text-fintech-slate text-[11.5px] font-medium px-1">
              <span>Data as of {freshnessStamp}</span>
            </div>
          </div>
        </div>

        {/* Stock Search Box with Dropdown */}
        <div className="w-full lg:w-[360px] relative">
          <label className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-slate block mb-1.5">
            Search Stocks
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-fintech-slate absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val.trim()) {
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search Reliance, TCS, HDFC, Infosys..."
              className="w-full h-[44px] pl-10 pr-9 rounded-[12px] bg-[#F8FAFC] border border-[#DCE5EE] focus:border-fintech-teal focus:bg-white focus:outline-none text-[13px] text-fintech-navy placeholder:text-slate-400 transition-all shadow-inner-subtle"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-fintech-teal animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-[16px] shadow-dialog border border-[#DCE5EE] p-2 z-50 max-h-[300px] overflow-y-auto animate-fade-in">
              <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-fintech-slate border-b border-[#EDF2F7]">
                Matching Equities
              </div>
              {searchResults.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelectSearchResult(item.symbol)}
                  className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-[#F0F5FA] flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-fintech-navy text-[13px] group-hover:text-fintech-teal">
                        {item.displaySymbol}
                      </span>
                      <span className="text-[10px] px-1 rounded bg-[#EDF2F7] text-fintech-slate">
                        {item.exchange}
                      </span>
                    </div>
                    <span className="text-[11.5px] text-fintech-slate truncate block">
                      {item.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-fintech-teal shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. ERROR STATE (IF ANY) */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-5 flex items-start justify-between text-rose-900 animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[14px]">Unable to load market data</h4>
              <p className="text-[12.5px] text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadStocks}
            className="px-4 py-1.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[12px] transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. POPULAR STOCKS GRID SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-fintech-navy">
              Popular Stocks
            </h2>
            <p className="text-[12px] text-fintech-slate">
              Top curated Nifty 50 constituent companies with latest market prices
            </p>
          </div>

          <button
            type="button"
            onClick={loadStocks}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-[12px] font-semibold text-fintech-teal hover:text-fintech-tealHover cursor-pointer py-1 px-2.5 rounded-[8px] hover:bg-[#EEF8F8] transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && stocks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 h-[168px] animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-slate-100 rounded"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="h-6 w-24 bg-slate-200 rounded"></div>
                  <div className="h-7 w-16 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isWatchlisted={watchlistSymbols.includes(stock.symbol)}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectStock={setSelectedStock}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. WATCHLIST SECTION */}
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-fintech-navy">My Watchlist</h3>
              <p className="text-[11.5px] text-fintech-slate">
                Locally saved stocks you are tracking • Persisted across browser sessions
              </p>
            </div>
          </div>

          <span className="text-[11.5px] font-bold text-fintech-slate bg-[#F0F5FA] px-2.5 py-1 rounded-full border border-[#DCE5EE]">
            {watchlistStocks.length} tracked
          </span>
        </div>

        {watchlistStocks.length === 0 ? (
          <div className="py-8 text-center bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] space-y-1.5">
            <Star className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-[13.5px] font-bold text-fintech-navy">Your watchlist is empty</p>
            <p className="text-[12px] text-fintech-slate max-w-sm mx-auto">
              Click the star icon on any stock card above to keep an eye on its real price movement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#EDF2F7] text-[11px] font-bold uppercase tracking-wider text-fintech-slate">
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Exchange</th>
                  <th className="pb-3 font-semibold text-right">Price</th>
                  <th className="pb-3 font-semibold text-right">Today's Move</th>
                  <th className="pb-3 font-semibold text-center">Trend</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF2F7]">
                {watchlistStocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center space-x-2.5">
                          <button
                            type="button"
                            title="Remove from watchlist"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWatchlist(stock.symbol);
                            }}
                            className="text-amber-500 hover:text-slate-400"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </button>
                          <div>
                            <span className="font-bold text-fintech-navy group-hover:text-fintech-teal transition-colors block leading-tight">
                              {stock.displaySymbol}
                            </span>
                            <span className="text-[11.5px] text-fintech-slate truncate max-w-[200px] block">
                              {stock.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F0F5FA] text-fintech-slate border border-[#DCE5EE]">
                          {stock.exchange}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-fintech-navy text-[14px]">
                        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center space-x-1 text-[12px] font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>
                            {isPositive ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-block">
                          <MiniSparkline data={stock.sparkline} isPositive={isPositive} width={80} height={24} />
                        </div>
                      </td>

                      <td className="py-3.5 pl-3 text-right">
                        <span className="text-[12px] font-bold text-fintech-teal group-hover:underline inline-flex items-center space-x-1">
                          <span>View stock</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. FINTECH COMPLIANCE / INFORMATIONAL SAFETY BANNER */}
      <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4 flex items-center space-x-3 text-[12px] text-fintech-slate">
        <ShieldCheck className="w-5 h-5 text-fintech-teal shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-fintech-navy">Informational Prototype:</strong> Real market quotes and historical charts are fetched for prototype demonstration. FinLit Ventures does not provide personalized investment advice or execute broker-dealer stock orders.
        </p>
      </div>
    </div>
  );
};
