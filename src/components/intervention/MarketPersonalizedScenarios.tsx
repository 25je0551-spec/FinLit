import React from 'react';
import { 
  Target, 
  ArrowRight
} from 'lucide-react';
import { GoalDetails } from '../../types';

interface MarketPersonalizedScenariosProps {
  goal: GoalDetails;
  sipAmount: number;
  pauseMonths: number;
  onSelectOption: (optionId: string) => void;
  onProceedWithOption: (optionId: string) => void;
}

export const MarketPersonalizedScenarios: React.FC<MarketPersonalizedScenariosProps> = ({
  goal,
  sipAmount,
  pauseMonths,
  onSelectOption,
  onProceedWithOption,
}) => {
  const currentGap = pauseMonths * sipAmount;

  // Helper for projected goal date
  const getProjectedDate = (months: number) => {
    if (months === 0) return goal.targetDate;
    const [mStr, yStr] = goal.targetDate.split(' ');
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = mNames.indexOf(mStr) !== -1 ? mNames.indexOf(mStr) : 2;
    const yVal = parseInt(yStr, 10) || 2029;
    const delay = months === 1 ? 1 : months === 3 ? 2 : 5;
    const d = new Date(yVal, mIdx + delay, 1);
    return `${mNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const scenarios = [
    {
      id: 'continue',
      title: 'Continue SIP',
      badge: 'Recommended • Lower Disruption',
      isPrimary: true,
      monthlySip: sipAmount,
      gap: 0,
      timelineImpact: 'Estimated on-track',
      targetDate: goal.targetDate,
      description: 'Maintains disciplined rupee-cost averaging through the current market valuation dip.',
    },
    {
      id: 'skip-1',
      title: 'Skip 1 Month',
      badge: 'Temporary Pause',
      isPrimary: false,
      monthlySip: 0,
      gap: sipAmount,
      timelineImpact: '~0–1 month delay',
      targetDate: getProjectedDate(1),
      description: 'Take a short 30-day breather with minimal disturbance to your long-term compounding.',
    },
    {
      id: 'pause-3',
      title: 'Pause 3 Months',
      badge: '3-Month Window',
      isPrimary: false,
      monthlySip: 0,
      gap: sipAmount * 3,
      timelineImpact: '~+2 months delay',
      targetDate: getProjectedDate(3),
      description: 'Pauses contributions for one quarter with automatic resumption safeguards.',
    },
    {
      id: 'pause-6',
      title: 'Pause 6 Months',
      badge: 'Full Pause',
      isPrimary: false,
      monthlySip: 0,
      gap: sipAmount * 6,
      timelineImpact: '~+5 months delay',
      targetDate: getProjectedDate(6),
      description: 'Extended pause creating a larger contribution gap toward your goal.',
    },
  ];

  return (
    <div className="bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-6 sm:p-7 text-left space-y-6 animate-fade-in">
      {/* 1. Header & Personal SIP Context (Section 10) */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-fintech-teal">
          <Target className="w-4 h-4 stroke-[2.2]" />
          <span className="text-[11.5px] font-bold uppercase tracking-wider">
            Personal SIP Impact
          </span>
        </div>
        <h3 className="text-[19px] sm:text-[21px] font-bold text-fintech-navy tracking-tight">
          What could this mean for your {goal.name} goal?
        </h3>
        <p className="text-[13px] text-fintech-slate leading-relaxed">
          While market benchmarks give historical context, your SIP decision directly affects the amount and timing of your own savings.
        </p>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="p-4 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
        <div>
          <span className="text-[11px] text-fintech-slate block">Current Monthly SIP</span>
          <span className="text-[15px] font-bold text-fintech-navy">
            ₹{sipAmount.toLocaleString('en-IN')} / month
          </span>
        </div>
        <div>
          <span className="text-[11px] text-fintech-slate block">
            If Paused for {pauseMonths} Months
          </span>
          <span className="text-[15px] font-bold text-rose-600">
            ₹{currentGap.toLocaleString('en-IN')} less contributed
          </span>
        </div>
        <div>
          <span className="text-[11px] text-fintech-slate block">Projected Completion Date</span>
          <span className="text-[15px] font-bold text-fintech-navy">
            {goal.targetDate} → <span className="text-amber-700">{getProjectedDate(pauseMonths)}</span>
          </span>
        </div>
      </div>

      {/* 2. "What if I wait?" Scenario Comparison Grid (Section 11) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[14.5px] font-bold text-fintech-navy">
            Your Choices (Compare Disruption Levels)
          </h4>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            AI prioritizes lower disruption
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-[16px] border transition-all text-left space-y-3 ${
                sc.isPrimary
                  ? 'bg-[#F2FAF9] border-fintech-teal/40 shadow-subtle ring-1 ring-fintech-teal/20'
                  : 'bg-white border-[#DCE5EE] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-fintech-navy">
                  {sc.title}
                </span>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                    sc.isPrimary
                      ? 'bg-fintech-teal text-white border-fintech-teal'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {sc.badge}
                </span>
              </div>

              <p className="text-[11.5px] text-fintech-slate leading-relaxed">
                {sc.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11.5px] pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Contribution Gap</span>
                  <span className="font-bold text-fintech-navy">
                    {sc.gap === 0 ? '₹0 (None)' : `₹${sc.gap.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Target Milestone</span>
                  <span className={`font-bold ${sc.gap === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {sc.targetDate}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectOption(sc.id);
                  onProceedWithOption(sc.id);
                }}
                className={`w-full py-2 px-3 rounded-[10px] text-[12px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  sc.isPrimary
                    ? 'bg-fintech-teal hover:bg-fintech-tealHover text-white shadow-subtle'
                    : 'bg-[#F0F5FA] hover:bg-[#E2E8F0] text-fintech-navy'
                }`}
              >
                <span>Select {sc.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
