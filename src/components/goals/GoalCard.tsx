import React from 'react';
import { 
  Check, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { GoalDetails } from '../../types';
import { renderGoalIcon } from './goalIcons';

interface GoalCardProps {
  goal: GoalDetails;
  onMakePrimary: (goalId: string) => void;
  onEdit: (goal: GoalDetails) => void;
  onDelete: (goalId: string) => void;
  onSimulate: (goal: GoalDetails) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onMakePrimary,
  onEdit,
  onDelete,
  onSimulate,
}) => {
  const isPrimary = goal.isPrimary;
  const isCompleted = goal.isCompleted || goal.status === 'Completed';

  const progressPercent = Math.min(
    100,
    Math.max(0, (goal.currentSavings / (goal.targetAmount || 1)) * 100)
  );

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      const inLakh = val / 100000;
      return `₹${inLakh.toFixed(inLakh % 1 === 0 ? 1 : 2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'On track':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>On track</span>
          </span>
        );
      case 'Needs attention':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Needs attention</span>
          </span>
        );
      case 'Behind plan':
      case 'Delayed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Behind plan</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            <span>{goal.status}</span>
          </span>
        );
    }
  };

  return (
    <div 
      className={`bg-white rounded-[20px] border transition-all duration-200 text-left flex flex-col justify-between p-6 shadow-card hover:shadow-md ${
        isPrimary 
          ? 'border-fintech-teal/50 ring-2 ring-fintech-teal/15 shadow-subtle' 
          : 'border-[#DCE5EE]'
      }`}
    >
      <div>
        {/* Top Header: Icon, Titles, and Status / Primary Badges */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EDF2F7]">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${
              isPrimary 
                ? 'bg-fintech-teal text-white border-fintech-teal shadow-subtle' 
                : 'bg-fintech-tealLight text-fintech-teal border-fintech-teal/20'
            }`}>
              {renderGoalIcon(goal.iconName, { className: 'w-6 h-6 stroke-[2.2]' })}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-[17px] font-bold text-fintech-navy truncate tracking-tight">
                  {goal.name}
                </h3>
              </div>
              <span className="text-[12px] text-fintech-slate font-medium block mt-0.5">
                {goal.category} • Priority: {goal.priority}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1.5 shrink-0">
            {isPrimary && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-fintech-teal text-white shadow-subtle">
                <Check className="w-3 h-3 stroke-[2.8]" />
                <span>PRIMARY GOAL</span>
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Goal Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-[#EDF2F7] text-left">
          <div>
            <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
              Target
            </span>
            <span className="text-[15px] font-extrabold text-fintech-navy block mt-0.5">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
              Target Date
            </span>
            <span className="text-[14px] font-bold text-fintech-navy block mt-0.5">
              {goal.targetDate}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
              Saved So Far
            </span>
            <span className="text-[15px] font-extrabold text-emerald-700 block mt-0.5">
              ₹{goal.currentSavings.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
              Monthly SIP
            </span>
            <span className="text-[14px] font-bold text-fintech-navy block mt-0.5">
              {goal.monthlyContribution > 0 
                ? `₹${goal.monthlyContribution.toLocaleString('en-IN')}/mo` 
                : 'Paused / None'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="py-4 space-y-2">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-fintech-slate font-medium">Accumulation Progress</span>
            <span className="font-bold text-fintech-navy">
              {progressPercent.toFixed(1)}% funded
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#EDF2F7] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted 
                  ? 'bg-blue-600' 
                  : isPrimary 
                  ? 'bg-fintech-teal' 
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* Linked SIP Info & Risk Tag */}
          <div className="flex flex-wrap items-center justify-between text-[11.5px] text-fintech-slate pt-1">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-fintech-teal" />
              <span>Linked: <strong className="text-fintech-navy">{goal.linkedSIPName || 'Flexi Cap Direct'}</strong></span>
            </div>
            {goal.riskPreference && (
              <span className="text-[11px] font-semibold text-fintech-slate bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#DCE5EE]">
                Strategy: {goal.riskPreference}
              </span>
            )}
          </div>
        </div>

        {/* Status Explanation / AI Advisory */}
        {goal.statusExplanation && (
          <div className="p-3 bg-[#F8FAFC] border border-[#DCE5EE] rounded-[12px] text-[12px] text-fintech-navyMuted flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-fintech-teal shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {goal.statusExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Card Action Buttons Footer */}
      <div className="pt-5 mt-4 border-t border-[#EDF2F7] flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {!isPrimary && !isCompleted && (
            <button
              type="button"
              onClick={() => onMakePrimary(goal.id)}
              className="px-3 py-1.5 rounded-[10px] bg-fintech-tealLight hover:bg-fintech-teal hover:text-white border border-fintech-teal/30 text-fintech-teal font-semibold text-[12px] transition-all cursor-pointer flex items-center space-x-1.5"
              title="Set this as your primary goal across Pause Saver & dashboard"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Make primary</span>
            </button>
          )}

          {!isCompleted && (
            <button
              type="button"
              onClick={() => onSimulate(goal)}
              className="px-3 py-1.5 rounded-[10px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[12px] transition-all cursor-pointer flex items-center space-x-1.5"
              title="Test changes to monthly SIP or pause impacts"
            >
              <Sliders className="w-3.5 h-3.5 text-fintech-teal" />
              <span>See impact</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-[8px] hover:bg-[#F0F5FA] text-fintech-slate hover:text-fintech-navy border border-transparent hover:border-[#DCE5EE] transition-all cursor-pointer"
            title="Edit goal details"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {!isPrimary && (
            <button
              type="button"
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-[8px] hover:bg-rose-50 text-fintech-slate hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
