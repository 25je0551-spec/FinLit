import React from 'react';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  ArrowDown, 
  RefreshCw, 
  PauseCircle, 
  Check,
  CheckCircle,
  Sliders,
  ArrowRight
} from 'lucide-react';
import type { DecisionOption, DecisionOptionId, IntentId, GoalDetails } from '../../types';
import { intentConfigurations } from '../../data/intentConfigs';

interface DecisionLadderProps {
  options: DecisionOption[];
  selectedOptionId: DecisionOptionId;
  selectedIntent: IntentId;
  goal?: GoalDetails;
  onSelectOption: (id: DecisionOptionId) => void;
  onConfirm: () => void;
  onBack: () => void;
  onContinueWithoutThis: () => void;
}

export const DecisionLadder: React.FC<DecisionLadderProps> = ({
  options,
  selectedOptionId,
  selectedIntent,
  goal,
  onSelectOption,
  onConfirm,
  onBack,
  onContinueWithoutThis,
}) => {
  const config = intentConfigurations[selectedIntent] || intentConfigurations.market_fear;

  const renderOptionIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-fintech-navy stroke-[2.2]";
    switch (iconName) {
      case 'Target':
        return <Target className="w-5 h-5 text-fintech-teal stroke-[2.3]" />;
      case 'Calendar':
        return <Calendar className={iconClass} />;
      case 'ArrowDown':
        return <ArrowDown className={iconClass} />;
      case 'RefreshCw':
        return <RefreshCw className={iconClass} />;
      case 'CheckCircle':
        return <CheckCircle className="w-5 h-5 text-emerald-600 stroke-[2.2]" />;
      case 'Sliders':
        return <Sliders className={iconClass} />;
      case 'PauseCircle':
      default:
        return <PauseCircle className={iconClass} />;
    }
  };

  const selectedOption = options.find((o) => o.id === selectedOptionId) || options[0];

  // Dynamic primary CTA label reflecting current choice
  const primaryButtonLabel = selectedOption?.primaryCtaLabel || config.primaryActionLabel;

  return (
    <div className="w-full bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-7 sm:p-8 animate-fade-in text-left">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7] mb-5">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 -ml-1 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-navy transition-colors cursor-pointer"
            title="Back to context"
          >
            <ArrowLeft className="w-5 h-5 text-fintech-navy stroke-[2.2]" />
          </button>
          <div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-fintech-navy tracking-tight leading-tight">
              Your options
            </h2>
            <p className="text-[12.5px] text-fintech-slate font-medium">
              {goal ? `How changes affect your ${goal.name} goal` : 'Suggested lower-disruption options'} • Tailored to {config.label}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-fintech-tealLight text-fintech-teal border border-fintech-teal/20">
          Ranked Ladder
        </span>
      </div>

      {/* Decision Options Grid */}
      <div className="space-y-3 mb-7">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <div
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`min-h-[72px] p-4 rounded-[14px] border flex items-center justify-between transition-all duration-150 cursor-pointer select-none ${
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
                  {renderOptionIcon(option.iconName)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[14.5px] font-bold text-fintech-navy truncate leading-tight">
                      {option.title}
                    </span>
                    {option.tag && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        option.id === 'continue' || option.id === 'review-plan' || option.id === 'update-goal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#F0F5FA] text-fintech-slate border border-[#DCE5EE]'
                      }`}>
                        {option.tag}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[12px] text-fintech-slate mt-0.5 truncate font-normal">
                    {option.subtitle}
                  </p>
                </div>
              </div>

              {/* Selection Checkmark */}
              <div className="flex items-center space-x-3 shrink-0 ml-2">
                <div className="text-right hidden sm:block">
                  <span className="text-[12px] font-bold text-fintech-navy block">
                    {option.newGoalDate}
                  </span>
                  <span className={`text-[10.5px] font-semibold ${
                    option.delayMonths === 0 ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    {option.delayMonths === 0 ? 'Zero delay' : `+${option.delayMonths} mo delay`}
                  </span>
                </div>

                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-fintech-teal text-white ring-2 ring-fintech-teal/30'
                    : 'border-2 border-[#CBD5E1] bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-5 border-t border-[#EDF2F7] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onConfirm}
            className="h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all flex items-center justify-center space-x-2 shadow-subtle active:scale-[0.99] cursor-pointer"
          >
            <span>{primaryButtonLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action Button */}
          <button
            type="button"
            onClick={onBack}
            className="h-[46px] rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[14.5px] transition-all flex items-center justify-center active:scale-[0.99] cursor-pointer"
          >
            <span>Back to Context</span>
          </button>
        </div>

        {/* Continue without this Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onContinueWithoutThis}
            className="text-[13.5px] font-medium text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer py-1 hover:underline"
          >
            {config.directPauseLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
