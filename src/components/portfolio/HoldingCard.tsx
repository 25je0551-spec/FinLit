import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  ShieldCheck,
  Target, 
  PieChart
} from 'lucide-react';
import { PortfolioHolding } from '../../types/portfolio';
import { GoalDetails } from '../../types';

interface HoldingCardProps {
  holding: PortfolioHolding;
  primaryGoal?: GoalDetails;
  onViewDetails: (holding: PortfolioHolding) => void;
  onNavigateToPauseSaver?: () => void;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
  holding,
  primaryGoal,
  onViewDetails,
  onNavigateToPauseSaver,
}) => {
  const isPositive = holding.totalReturn >= 0;
  const isMF = holding.type === 'mutual_fund';
  const isLinkedToPrimary = primaryGoal && (holding.linkedGoalId === primaryGoal.id || (isMF && primaryGoal.isPrimary));
  const activeGoalName = isLinkedToPrimary ? primaryGoal.name : holding.linkedGoalName;

  return (
    <div className="bg-white rounded-[20px] border border-[#DCE5EE] p-6 shadow-card hover:border-[#B8CDDC] transition-all text-left flex flex-col justify-between group">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#EDF2F7]">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isMF 
                  ? 'bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20' 
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {isMF ? 'Mutual Fund' : (holding.exchange || 'NSE')}
              </span>

              {isLinkedToPrimary && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Primary Goal</span>
                </span>
              )}
            </div>

            <h3 className="text-[17px] font-bold text-fintech-navy group-hover:text-fintech-teal transition-colors truncate">
              {holding.name}
            </h3>
            <p className="text-[12px] text-fintech-slate mt-0.5 truncate">
              {isMF ? `SIP • ₹${(holding.monthlySip || 4000).toLocaleString('en-IN')}/month` : `${holding.displaySymbol} • ${holding.quantity || 0} shares`}
            </p>
          </div>

          {/* Icon badge */}
          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border ${
            isMF 
              ? 'bg-fintech-tealLight border-fintech-teal/20 text-fintech-teal' 
              : 'bg-sky-50 border-sky-200 text-sky-600'
          }`}>
            {isMF ? <PieChart className="w-5 h-5 stroke-[2.2]" /> : <TrendingUp className="w-5 h-5 stroke-[2.2]" />}
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 text-[12px]">
          {isMF ? (
            <>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Invested</span>
                <span className="text-[15px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{holding.investedAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Current Value</span>
                <span className="text-[15px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{holding.currentValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Total Return</span>
                <div className={`flex items-baseline space-x-1 mt-0.5 ${isPositive ? 'text-emerald-700' : 'text-rose-600'} font-bold`}>
                  <span className="text-[14px]">
                    {isPositive ? '+' : ''}₹{holding.totalReturn.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px]">
                    ({isPositive ? '+' : ''}{holding.returnPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">XIRR</span>
                <span className="text-[14px] font-bold text-emerald-700 mt-0.5 block">
                  +{holding.xirr || 14.8}%
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Avg. Buy Price</span>
                <span className="text-[14.5px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{(holding.averageBuyPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Current Price</span>
                <span className="text-[14.5px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{holding.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Invested</span>
                <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{holding.investedAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] uppercase font-bold text-fintech-slate block">Current Value</span>
                <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{holding.currentValue.toLocaleString('en-IN')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Stock Return Bar (if stock) */}
        {!isMF && (
          <div className="mb-3 p-2.5 bg-[#F8FAFC] rounded-[10px] border border-[#DCE5EE] flex items-center justify-between text-[11.5px]">
            <span className="text-fintech-slate font-medium">Position P&L:</span>
            <div className={`font-bold flex items-center space-x-1 ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}₹{holding.totalReturn.toLocaleString('en-IN')} ({isPositive ? '+' : ''}{holding.returnPercent.toFixed(1)}%)</span>
            </div>
          </div>
        )}

        {/* Goal Link & Pause Saver Guard Pills */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-[12px] text-fintech-navy font-semibold bg-[#F0F5FA] px-3 py-1.5 rounded-[10px] border border-[#DCE5EE]">
            <Target className="w-3.5 h-3.5 text-fintech-teal shrink-0" />
            <span className="truncate">Goal: {activeGoalName}</span>
          </div>

          {isMF && onNavigateToPauseSaver && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToPauseSaver();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-[10px] bg-[#EEF8F8] border border-[#CDEAEB] text-fintech-teal hover:bg-[#E2F3F3] transition-colors text-[11px] font-bold cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Pause Saver™ Protected</span>
              </div>
              <span className="underline font-semibold">Manage SIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Footer Button */}
      <button
        type="button"
        onClick={() => onViewDetails(holding)}
        className="w-full h-[42px] rounded-[12px] bg-[#F0F5FA] hover:bg-fintech-teal hover:text-white text-fintech-navy font-semibold text-[13px] border border-[#DCE5EE] hover:border-fintech-teal transition-all flex items-center justify-center space-x-2 group-hover:shadow-subtle cursor-pointer active:scale-[0.99]"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};
