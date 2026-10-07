import React from 'react';
import { 
  Wallet, 
  TrendingDown, 
  IndianRupee, 
  Target, 
  MoreHorizontal, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { IntentId, IntentReason, GoalDetails } from '../../types';

interface IntentDetectionProps {
  reasons: IntentReason[];
  selectedReason: IntentId | null;
  goal?: GoalDetails;
  onSelectReason: (id: IntentId) => void;
  onConfirm: () => void;
  onContinueWithoutThis: () => void;
  onBack: () => void;
}

export const IntentDetection: React.FC<IntentDetectionProps> = ({
  reasons,
  selectedReason,
  goal,
  onSelectReason,
  onConfirm,
  onContinueWithoutThis,
}) => {
  const renderIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-fintech-teal stroke-[2.2]";
    switch (iconName) {
      case 'Wallet':
        return <Wallet className={iconClass} />;
      case 'TrendingDown':
        return <TrendingDown className={iconClass} />;
      case 'IndianRupee':
        return <IndianRupee className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'MoreHorizontal':
      default:
        return <MoreHorizontal className={iconClass} />;
    }
  };

  return (
    <div className="w-full bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-7 sm:p-8 animate-fade-in text-left">
      {/* AI Context Badge */}
      <div className="flex items-center space-x-2 text-fintech-teal mb-3">
        <Sparkles className="w-4 h-4" />
        <span className="text-[11.5px] font-bold uppercase tracking-wider">
          Pause Saver AI • Context Check
        </span>
      </div>

      {/* Main Headings */}
      <div className="mb-6">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight leading-snug">
          Quick check: before you change this SIP
        </h2>
        <p className="text-[17px] sm:text-[18px] font-semibold text-fintech-navy mt-1.5">
          What’s driving this?
        </p>
        {goal && (
          <p className="text-[12.5px] text-fintech-slate mt-1 font-medium">
            Currently contributing ₹{(goal.monthlyContribution || 4000).toLocaleString('en-IN')}/month toward your {goal.name} goal ({goal.targetDate}).
          </p>
        )}
      </div>

      {/* 2-Column Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-7">
        {reasons.map((reason) => {
          const isSelected = selectedReason === reason.id;
          return (
            <button
              key={reason.id}
              type="button"
              onClick={() => onSelectReason(reason.id)}
              className={`min-h-[72px] p-4 rounded-[14px] border flex items-center justify-between transition-all duration-150 cursor-pointer text-left select-none ${
                isSelected
                  ? 'bg-fintech-tealLight border-fintech-teal ring-1.5 ring-fintech-teal shadow-subtle'
                  : 'bg-white border-[#DCE5EE] hover:border-[#B8CDDC] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
                  isSelected 
                    ? 'bg-white border-fintech-teal/30 shadow-subtle' 
                    : 'bg-[#F8FAFC] border-[#DCE5EE]'
                }`}>
                  {renderIcon(reason.iconName)}
                </div>

                <div className="min-w-0">
                  <span className="text-[14.5px] font-bold text-fintech-navy block truncate leading-tight">
                    {reason.label}
                  </span>
                  <span className="text-[12px] text-fintech-slate block truncate mt-0.5 font-normal">
                    {reason.description}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-fintech-teal text-white flex items-center justify-center shrink-0 ml-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-5 border-t border-[#EDF2F7] flex items-center justify-between">
        <button
          type="button"
          onClick={onContinueWithoutThis}
          className="text-[14.5px] font-medium text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer py-2 hover:underline"
        >
          Continue without this
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedReason}
          className={`h-[46px] px-6 rounded-[12px] font-semibold text-[14.5px] transition-all flex items-center space-x-1.5 ${
            selectedReason
              ? 'bg-fintech-teal hover:bg-fintech-tealHover text-white shadow-subtle active:scale-[0.99] cursor-pointer'
              : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed opacity-70'
          }`}
        >
          <span>Personalize Options</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
