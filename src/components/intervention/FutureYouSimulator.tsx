import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Wallet,
  Activity
} from 'lucide-react';
import type { GoalDetails, DecisionOption, IntentId } from '../../types';
import { getIntentConfig } from '../../data/intentConfigs';

interface FutureYouSimulatorProps {
  goal: GoalDetails;
  selectedOption: DecisionOption;
  selectedIntent: IntentId;
}

export const FutureYouSimulator: React.FC<FutureYouSimulatorProps> = ({
  goal,
  selectedOption,
  selectedIntent,
}) => {
  const [showModelDetails, setShowModelDetails] = useState(false);
  const config = getIntentConfig(selectedIntent, goal);

  const monthlySIP = goal.monthlyContribution || 4000;
  const delayMonths = selectedOption.delayMonths || 0;
  const calculatedGap = selectedOption.contributionGap > 0 
    ? selectedOption.contributionGap 
    : (delayMonths === 0 ? 0 : Math.max(monthlySIP, delayMonths * monthlySIP));
  const calculatedCompounding = selectedOption.compoundingLoss > 0
    ? selectedOption.compoundingLoss
    : Math.round(calculatedGap * 0.31);

  const getProjectedDate = (monthsDelay: number) => {
    if (monthsDelay === 0) return goal.targetDate;
    const [mStr, yStr] = goal.targetDate.split(' ');
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = mNames.indexOf(mStr) !== -1 ? mNames.indexOf(mStr) : 2;
    const yVal = parseInt(yStr, 10) || 2029;
    const d = new Date(yVal, mIdx + monthsDelay, 1);
    return `${mNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const projectedDate = selectedOption.newGoalDate || getProjectedDate(delayMonths);

  return (
    <div className="w-full bg-white border border-[#DCE5EE] rounded-[20px] p-6 shadow-card space-y-5 text-left animate-fade-in">
      {/* 1. Header with Focus Badge */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-fintech-tealLight border border-fintech-teal/20 flex items-center justify-center text-fintech-teal shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-fintech-teal stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-fintech-navy leading-snug">
              Future You™ Simulator
            </h3>
            <p className="text-[12px] text-fintech-slate font-medium">
              Focus: {config.badgeLabel}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
          Target: {goal.targetAmount >= 100000 ? `₹${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)}L` : `₹${goal.targetAmount.toLocaleString('en-IN')}`}
        </span>
      </div>

      {/* 2. Intent-Specific Focus Box */}
      
      {/* FOCUS A: CASH FLOW (For cash_need) */}
      {config.simulatorFocus === 'cash_flow' && (
        <div className="bg-[#EEF8F8] rounded-[14px] p-4.5 border border-[#CDEAEB] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-fintech-teal font-bold text-[13px]">
              <Wallet className="w-4 h-4" />
              <span>Cash Flexibility Readout</span>
            </div>
            <span className="text-[11px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-[#CDEAEB]">
              Emergency Relief
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
              <span className="text-[10px] uppercase font-bold text-fintech-slate block">Monthly Cash Freed</span>
              <span className="text-[16px] font-extrabold text-emerald-700 mt-0.5 block">
                +₹2,000 / mo
              </span>
            </div>
            <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
              <span className="text-[10px] uppercase font-bold text-fintech-slate block">Projected Goal Delay</span>
              <span className="text-[16px] font-extrabold text-fintech-navy mt-0.5 block">
                ~1-2 Months
              </span>
            </div>
          </div>
          <p className="text-[11.5px] text-fintech-navyMuted leading-tight">
            Freeing ₹2,000/mo allows immediate breathing room while keeping ₹2,000/mo growing towards your {goal.name}.
          </p>
        </div>
      )}

      {/* FOCUS B: PLAN HEALTH (For performance_doubt) */}
      {config.simulatorFocus === 'plan_health' && (
        <div className="bg-[#F8FAFC] rounded-[14px] p-4.5 border border-[#DCE5EE] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-fintech-navy font-bold text-[13px]">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Milestone Audit vs Target</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              14.8% XIRR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
              <span className="text-[10px] uppercase font-bold text-fintech-slate block">Invested</span>
              <span className="text-[14px] font-bold text-fintech-navy block">₹96,000</span>
              <span className="text-[10px] text-emerald-600">24 SIP debits</span>
            </div>
            <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
              <span className="text-[10px] uppercase font-bold text-fintech-slate block">Current Value</span>
              <span className="text-[14px] font-bold text-emerald-700 block">₹1,18,420</span>
              <span className="text-[10px] text-fintech-slate">+₹22,420 gain</span>
            </div>
          </div>
          <p className="text-[11.5px] text-fintech-slate leading-tight">
            Your fund is outperforming the 12% target benchmark by +2.8%. Pausing now would interrupt compounding.
          </p>
        </div>
      )}

      {/* FOCUS C: GOAL TARGET (For goal_change) */}
      {config.simulatorFocus === 'goal_target' && (
        <div className="bg-[#F8FAFC] rounded-[14px] p-4.5 border border-[#DCE5EE] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-fintech-navy font-bold text-[13px]">
              <Target className="w-4 h-4 text-fintech-teal" />
              <span>Target Recalibration</span>
            </div>
            <span className="text-[11px] font-bold text-fintech-teal bg-fintech-tealLight px-2 py-0.5 rounded-full border border-fintech-teal/20">
              Adaptive
            </span>
          </div>

          <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE] text-[12px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-fintech-slate">Original Target:</span>
              <span className="font-bold text-fintech-navy">
                ₹{(goal.targetAmount / 100000).toFixed(1)} Lakh ({goal.targetDate})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fintech-slate">Revised Target Run-rate:</span>
              <span className="font-bold text-fintech-teal">Flexible (Adjusted)</span>
            </div>
          </div>
          <p className="text-[11.5px] text-fintech-slate leading-tight">
            Updating the goal preserves your accumulated ₹{(goal.currentSavings / 100000).toFixed(2)} Lakh corpus while fitting your revised budget.
          </p>
        </div>
      )}

      {/* FOCUS D: MARKET TIMELINE & LIGHT SNAPSHOT (Standard Timeline Bar) */}
      {(config.simulatorFocus === 'market_timeline' || config.simulatorFocus === 'light_snapshot') && (
        <div className="bg-[#F8FAFC] rounded-[14px] p-4 border border-[#DCE5EE] space-y-3">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="font-semibold text-fintech-slate">Projected Goal Shift:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11.5px] ${
              selectedOption.delayMonths === 0
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {selectedOption.delayMonths === 0 ? 'Zero delay (On track)' : `+${selectedOption.delayMonths} mo delay`}
            </span>
          </div>

          {/* Timeline Visualization */}
          <div className="bg-white rounded-[10px] p-3 border border-[#DCE5EE] space-y-2.5">
            <div className="flex items-center justify-between text-[12.5px] font-bold">
              <span className="text-emerald-700">Original: {goal.targetDate}</span>
              <span className={selectedOption.delayMonths === 0 ? 'text-emerald-700' : 'text-rose-600'}>
                New: {projectedDate}
              </span>
            </div>

            <div className="py-1">
              <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: '80%' }}
                ></div>
                {selectedOption.delayMonths > 0 && (
                  <div 
                    className="absolute top-0 right-0 h-full bg-rose-400 rounded-r-full"
                    style={{ width: `${Math.min(20, selectedOption.delayMonths * 4)}%` }}
                  ></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EDF2F7]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-slate block">
                  Missed Deposit
                </span>
                <span className="text-[14px] font-bold text-fintech-navy mt-0.5 block">
                  ₹{calculatedGap.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fintech-slate block">
                  Compounding Gap
                </span>
                <span className="text-[14px] font-bold text-amber-800 mt-0.5 block">
                  ~₹{calculatedCompounding.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Goal Progress Anchor */}
      <div className="bg-[#F8FAFC] rounded-[14px] p-4 border border-[#DCE5EE]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal shrink-0">
              <Target className="w-4 h-4 text-fintech-teal stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[13.5px] font-bold text-fintech-navy block truncate">
                {goal.name}
              </span>
              <span className="text-[11.5px] text-fintech-slate font-medium block">
                Target by {goal.targetDate}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[13.5px] font-bold text-fintech-navy block">
              {goal.currentSavings >= 100000 
                ? `₹${(goal.currentSavings / 100000).toFixed(2)} Lakh` 
                : `₹${goal.currentSavings.toLocaleString('en-IN')}`}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block">
              Accumulated
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 pt-2 border-t border-[#EDF2F7]">
          <div className="flex justify-between text-[11px] font-medium text-fintech-slate mb-1.5">
            <span>Progress to Goal</span>
            <span>{((goal.currentSavings / (goal.targetAmount || 1)) * 100).toFixed(1)}% reached</span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-fintech-teal rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, (goal.currentSavings / (goal.targetAmount || 1)) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. Explainability Accordion Row */}
      <div className="border border-[#DCE5EE] rounded-[12px] overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setShowModelDetails(!showModelDetails)}
          className="w-full flex items-center justify-between p-3.5 text-[13px] font-semibold text-fintech-navy hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-fintech-teal stroke-[2.2] shrink-0" />
            <span>Why am I seeing this?</span>
          </div>
          {showModelDetails ? (
            <ChevronUp className="w-3.5 h-3.5 text-fintech-slate" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-fintech-slate" />
          )}
        </button>

        {showModelDetails && (
          <div className="p-3.5 pt-0 text-[11.5px] text-fintech-slate space-y-2 border-t border-[#EDF2F7] bg-[#FAFCFE] animate-fade-in leading-relaxed">
            <p>
              {config.explainabilityNote}
            </p>
            <div className="flex items-center space-x-1.5 text-fintech-teal font-semibold text-[11px] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Auto-Resume safety net active for all temporary changes</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Disclaimer */}
      <p className="text-[11px] text-center text-fintech-lightSlate leading-normal px-2 pt-1 border-t border-[#EDF2F7]">
        Projections are estimates for decision support, not guaranteed returns. You always make the final decision.
      </p>
    </div>
  );
};
