import React from 'react';
import { Star, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { StockQuote } from '../../types/market';
import { MiniSparkline } from './MiniSparkline';

interface StockCardProps {
  stock: StockQuote;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockQuote) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  isWatchlisted,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const isPositive = stock.change >= 0;

  return (
    <div
      onClick={() => onSelectStock(stock)}
      className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card hover:shadow-md hover:border-fintech-teal/40 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative"
    >
      {/* Top Row: Symbol, Exchange & Star */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[16px] font-extrabold text-fintech-navy tracking-tight group-hover:text-fintech-teal transition-colors">
              {stock.displaySymbol}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F0F5FA] text-fintech-slate border border-[#DCE5EE]">
              {stock.exchange}
            </span>
          </div>

          <button
            type="button"
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(stock.symbol);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                isWatchlisted ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
              }`}
            />
          </button>
        </div>

        {/* Company Name */}
        <h4 className="text-[12.5px] text-fintech-slate font-medium truncate mb-4" title={stock.name}>
          {stock.name}
        </h4>
      </div>

      {/* Middle Row: Price & % Change */}
      <div className="my-2 flex items-baseline justify-between">
        <div>
          <span className="text-[20px] font-bold text-fintech-navy tracking-tight block">
            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div
            className={`inline-flex items-center space-x-1 text-[11.5px] font-bold mt-0.5 ${
              isPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}% today
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="shrink-0 pt-1">
          <MiniSparkline data={stock.sparkline} isPositive={isPositive} width={96} height={32} />
        </div>
      </div>

      {/* Bottom Footer: View Stock CTA */}
      <div className="pt-3 border-t border-[#EDF2F7] mt-3 flex items-center justify-between text-[12px] font-semibold text-fintech-teal group-hover:text-fintech-tealHover transition-colors">
        <span>View stock</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
