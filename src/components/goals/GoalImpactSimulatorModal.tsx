import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Info
} from 'lucide-react';
import type { GoalDetails } from '../../types';
import { renderGoalIcon } from './goalIcons';

interface GoalImpactSimulatorModalProps {
  goal: GoalDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoalImpactSimulatorModal: React.FC<GoalImpactSimulatorModalProps> = ({
  goal,
  isOpen,
  onClose,
}) => {
  // Simulator State (Must be unconditionally called before early return)
  const [pauseMonths, setPauseMonths] = useState<number>(3);
  const [sipReduction, setSipReduction] = useState<number>(0);

  if (!isOpen || !goal) return null;

  const originalSIP = goal.monthlyContribution || 4000;
  const effectiveMonthlySIP = Math.max(0, originalSIP - sipReduction);

  // Parse target date to calculate shift
  const [monthStr, yearStr] = goal.targetDate.split(' ');
  const targetYear = parseInt(yearStr, 10) || 2029;

  // Calculate delay based on pause months and reduction
  const pauseDelayMonths = pauseMonths === 0 ? 0 : pauseMonths === 1 ? 1 : pauseMonths === 3 ? 2 : 5;
  const reductionDelayMonths = sipReduction > 0 ? Math.ceil((sipReduction / (originalSIP || 1)) * 4) : 0;
  const totalDelayMonths = pauseDelayMonths + reductionDelayMonths;

  // Contribution gap
  const missedFromPause = pauseMonths * originalSIP;
  const missedFromReduction = sipReduction * (goal.monthsRemaining || 30);
  const totalContributionGap = missedFromPause + (pauseMonths === 0 ? missedFromReduction : 0);

  // Compounding loss estimate
  const assumedReturn = goal.assumedAnnualReturn || 12.0;
  const r = assumedReturn / 100;
  const compoundingLoss = Math.round(totalContributionGap * Math.pow(1 + r, Math.max(1, (goal.monthsRemaining || 30) / 12) * 0.4) - totalContributionGap);

  // Derive projected status under this simulation
  const projectedStatus = 
    totalDelayMonths === 0 ? 'On track' :
    totalDelayMonths <= 3 ? 'Needs attention' : 'Behind plan';

  // Projected new date string
  const getProjectedTargetDate = () => {
    if (totalDelayMonths === 0) return goal.targetDate;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = months.indexOf(monthStr) !== -1 ? months.indexOf(monthStr) : 2;
    const newDate = new Date(targetYear, currentMonthIdx + totalDelayMonths, 1);
    const newMonth = months[newDate.getMonth()];
    const newYear = newDate.getFullYear();
    return `${newMonth} ${newYear}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-fintech-navy/60 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[22px] border border-[#DCE5EE] shadow-2xl max-w-2xl w-full my-auto overflow-hidden text-left animate-slide-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EDF2F7] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[12px] bg-fintech-tealLight border border-fintech-teal/20 text-fintech-teal flex items-center justify-center">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-[20px] font-bold text-fintech-navy">
                  Goal Impact Simulator
                </h2>
                <span className="text-[11px] font-bold text-fintech-teal bg-fintech-tealLight px-2 py-0.5 rounded-full border border-fintech-teal/20">
                  {goal.name}
                </span>
              </div>
              <p className="text-[12.5px] text-fintech-slate">
                Test how temporary pauses or reduced SIPs affect target date and compounding
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Baseline Goal Stats */}
          <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal">
                {renderGoalIcon(goal.iconName, { className: 'w-4.5 h-4.5 stroke-[2.2]' })}
              </div>
              <div>
                <span className="text-[14px] font-bold text-fintech-navy block">
                  {goal.name} • ₹{(goal.targetAmount / 100000).toFixed(1)} Lakh
                </span>
                <span className="text-[12px] text-fintech-slate">
                  Target: {goal.targetDate} • Monthly SIP: ₹{originalSIP.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11.5px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Baseline: {goal.status}
              </span>
            </div>
          </div>

          {/* SIMULATION CONTROL 1: PAUSE DURATION */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">
                Option A: What if you pause SIP temporarily?
              </span>
              <span className="text-[12px] font-bold text-fintech-teal">
                {pauseMonths === 0 ? 'No pause (Keep active)' : `${pauseMonths} month${pauseMonths > 1 ? 's' : ''} pause`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[0, 1, 3, 6].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setPauseMonths(months)}
                  className={`py-2.5 px-3 rounded-[12px] text-[13px] font-bold border transition-all cursor-pointer ${
                    pauseMonths === months
                      ? 'bg-fintech-teal text-white border-fintech-teal shadow-subtle'
                      : 'bg-[#F8FAFC] text-fintech-navy border-[#DCE5EE] hover:bg-[#F0F5FA]'
                  }`}
                >
                  {months === 0 ? 'Keep Active' : `${months} month${months > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATION CONTROL 2: REDUCE MONTHLY CONTRIBUTION */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">
                Option B: Or step-down monthly SIP instead?
              </span>
              <span className="text-[12px] font-bold text-fintech-teal">
                ₹{effectiveMonthlySIP.toLocaleString('en-IN')} / mo effective
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[0, 1000, 2000, Math.floor(originalSIP * 0.5)].map((reduction) => (
                <button
                  key={reduction}
                  type="button"
                  onClick={() => setSipReduction(reduction)}
                  className={`py-2.5 px-3 rounded-[12px] text-[13px] font-bold border transition-all cursor-pointer ${
                    sipReduction === reduction
                      ? 'bg-fintech-teal text-white border-fintech-teal shadow-subtle'
                      : 'bg-[#F8FAFC] text-fintech-navy border-[#DCE5EE] hover:bg-[#F0F5FA]'
                  }`}
                >
                  {reduction === 0 ? 'Full ₹' + originalSIP : `-₹${reduction}/mo`}
                </button>
              ))}
            </div>
          </div>

          {/* PROJECTED SIMULATION IMPACT READOUT */}
          <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[16px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#CDEAEB]">
              <div className="flex items-center space-x-2 text-fintech-teal font-bold text-[14px]">
                <Sparkles className="w-4.5 h-4.5 text-fintech-teal" />
                <span>Simulated Impact Projection</span>
              </div>
              <span className={`text-[11.5px] font-extrabold px-3 py-0.5 rounded-full ${
                projectedStatus === 'On track' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : projectedStatus === 'Needs attention' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                Projected Status: {projectedStatus}
              </span>
            </div>

            {/* Readout Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] font-bold text-fintech-slate uppercase tracking-wider block">
                  Original Date
                </span>
                <span className="text-[14px] font-bold text-emerald-700 block mt-0.5">
                  {goal.targetDate}
                </span>
              </div>

              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] font-bold text-fintech-slate uppercase tracking-wider block">
                  Projected Date
                </span>
                <span className={`text-[14px] font-bold block mt-0.5 ${
                  totalDelayMonths === 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {getProjectedTargetDate()}
                </span>
              </div>

              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] font-bold text-fintech-slate uppercase tracking-wider block">
                  Timeline Shift
                </span>
                <span className="text-[14px] font-bold text-fintech-navy block mt-0.5">
                  +{totalDelayMonths} month{totalDelayMonths !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] font-bold text-fintech-slate uppercase tracking-wider block">
                  Missed Deposits
                </span>
                <span className="text-[14px] font-bold text-fintech-navy block mt-0.5">
                  ₹{totalContributionGap.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Visual Timeline Bar */}
            <div className="bg-white p-4 rounded-[12px] border border-[#DCE5EE] space-y-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-fintech-slate font-medium">Timeline Preservation</span>
                <span className="font-bold text-fintech-navy">
                  {totalDelayMonths === 0 ? '100% on schedule' : `Shifted by ~${totalDelayMonths} months`}
                </span>
              </div>
              <div className="h-2.5 bg-[#EDF2F7] rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.max(40, 100 - totalDelayMonths * 8)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-fintech-slate pt-1">
                <span>Current Accumulated: ₹{goal.currentSavings.toLocaleString('en-IN')}</span>
                <span>Compounding Loss: ~₹{compoundingLoss.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE] text-[11.5px] text-fintech-slate flex items-start space-x-2 leading-relaxed">
            <Info className="w-4 h-4 text-fintech-teal shrink-0 mt-0.5" />
            <p>
              Projections are educational simulations calculated using compound interest at an assumed {assumedReturn}% annual return. Actual market performance fluctuates and returns are not guaranteed.
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 border-t border-[#EDF2F7] bg-[#FAFCFE] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setPauseMonths(0);
              setSipReduction(0);
            }}
            className="px-4 py-2 rounded-[10px] text-fintech-slate hover:text-fintech-navy text-[12.5px] font-semibold cursor-pointer"
          >
            Reset Simulator
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[13px] shadow-subtle hover:shadow transition-all cursor-pointer"
          >
            Done with Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
