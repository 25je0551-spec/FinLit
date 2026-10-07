import React from 'react';
import { Target, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioHolding } from '../../types/portfolio';
import { GoalDetails } from '../../types';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  primaryGoal?: GoalDetails;
  onViewDetails: (holding: PortfolioHolding) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  primaryGoal,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-6 shadow-card text-left space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#EDF2F7]">
        <div>
          <h3 className="text-[18px] font-bold text-fintech-navy tracking-tight">
            All Holdings
          </h3>
          <p className="text-[12px] text-fintech-slate mt-0.5">
            Complete breakdown of your active equity, mutual fund and stock assets
          </p>
        </div>
        <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0F5FA] text-fintech-navy border border-[#DCE5EE]">
          {holdings.length} Assets
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#EDF2F7] text-fintech-slate font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3">Investment</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">Invested</th>
              <th className="py-3 px-3 text-right">Current Value</th>
              <th className="py-3 px-3 text-right">Returns</th>
              <th className="py-3 px-3 text-right">Return %</th>
              <th className="py-3 px-3">Supporting Goal</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF2F7]">
            {holdings.map((h) => {
              const isPositive = h.totalReturn >= 0;
              const isMF = h.type === 'mutual_fund';
              const isPrimaryGoal = primaryGoal && (h.linkedGoalId === primaryGoal.id || (isMF && primaryGoal.isPrimary));
              const goalName = isPrimaryGoal ? primaryGoal.name : h.linkedGoalName;

              return (
                <tr 
                  key={h.id} 
                  onClick={() => onViewDetails(h)}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-fintech-navy block group-hover:text-fintech-teal transition-colors">
                      {h.name}
                    </span>
                    <span className="text-[11px] text-fintech-slate font-medium">
                      {isMF ? `SIP ₹${(h.monthlySip || 4000).toLocaleString('en-IN')}/mo` : `${h.displaySymbol} • ${h.quantity} shares`}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isMF 
                        ? 'bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20' 
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {isMF ? 'Mutual Fund' : 'Stock'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-fintech-navy">
                    ₹{h.investedAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-fintech-navy">
                    ₹{h.currentValue.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                      {isPositive ? '+' : ''}₹{h.totalReturn.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={`inline-flex items-center space-x-0.5 ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? '+' : ''}{h.returnPercent.toFixed(2)}%</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-fintech-teal shrink-0" />
                      <span className="text-[12px] font-semibold text-fintech-navy truncate max-w-[140px]">
                        {goalName}
                      </span>
                      {isPrimaryGoal && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Primary
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(h);
                      }}
                      className="px-2.5 py-1 rounded-[8px] bg-[#F0F5FA] hover:bg-fintech-teal hover:text-white text-fintech-navy font-semibold text-[11.5px] border border-[#DCE5EE] transition-all cursor-pointer inline-flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
