import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Bell, 
  Smartphone, 
  RotateCcw
} from 'lucide-react';
import type { DecisionOption, IntentId, GoalDetails } from '../../types';

interface ConfirmationCardProps {
  autoResumeDate: string;
  selectedOption: DecisionOption;
  selectedIntent: IntentId;
  goal?: GoalDetails;
  onDone: () => void;
  onChangeDates: () => void;
  onReset: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  autoResumeDate,
  selectedOption,
  selectedIntent,
  goal,
  onDone,
  onChangeDates,
  onReset,
}) => {
  const isContinue = selectedOption.id === 'continue';
  const isReduction = selectedOption.id === 'reduce-amount' || selectedOption.id === 'reduce-3000' || selectedOption.id === 'step-down';
  const isGoalUpdate = selectedOption.id === 'update-goal' || selectedOption.id === 'modify-sip' || selectedOption.id === 'change-date';
  const isReviewPlan = selectedOption.id === 'review-plan';

  const intentLabel = 
    selectedIntent === 'cash_need' ? 'Cash Flexibility Path' :
    selectedIntent === 'market_fear' ? 'Market Protection Path' :
    selectedIntent === 'performance_doubt' ? 'Plan Audit Path' :
    selectedIntent === 'goal_change' ? 'Goal Realignment Path' : 'Quick Snapshot Path';

  return (
    <div className="w-full bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-7 sm:p-8 animate-fade-in text-left">
      {/* Top Header */}
      <div className="text-center pb-5">
        <div className="w-14 h-14 rounded-full bg-fintech-tealLight border border-fintech-teal/20 mx-auto flex items-center justify-center text-fintech-teal mb-3 shadow-subtle">
          <CheckCircle2 className="w-7 h-7 text-fintech-teal stroke-[2.3]" />
        </div>

        <div className="inline-block mb-2">
          <span className="text-[11px] font-bold text-fintech-teal bg-fintech-tealLight border border-fintech-teal/20 px-3 py-0.5 rounded-full uppercase tracking-wider">
            {intentLabel} Confirmed
          </span>
        </div>

        {isContinue ? (
          <>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
              SIP Remains Active & On Track
            </h2>
            <p className="text-[13.5px] font-semibold text-emerald-700 mt-1">
              Your {goal ? `₹${(goal.targetAmount / 100000).toFixed(1)} Lakh ${goal.name.toLowerCase()}` : '₹8 Lakh'} goal stays projected for {goal?.targetDate || 'Mar 2029'}
            </p>
          </>
        ) : isReduction ? (
          <>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
              SIP Reduced: {selectedOption.title}
            </h2>
            <p className="text-[13.5px] font-semibold text-emerald-700 mt-1">
              Immediate cash relief enabled • Auto-restores on {autoResumeDate}
            </p>
          </>
        ) : isGoalUpdate ? (
          <>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
              Goal & SIP Plan Recalibrated
            </h2>
            <p className="text-[13.5px] font-semibold text-emerald-700 mt-1">
              Your ₹{(goal?.monthlyContribution || 4000).toLocaleString('en-IN')}/mo SIP is now synchronized with your revised goal
            </p>
          </>
        ) : isReviewPlan ? (
          <>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
              Plan Health Audited & Confirmed
            </h2>
            <p className="text-[13.5px] font-semibold text-emerald-700 mt-1">
              14.8% XIRR verified • Milestone remains on track for {goal?.targetDate || 'Mar 2029'}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
              SIP paused until {autoResumeDate}
            </h2>
            <p className="text-[13.5px] font-semibold text-fintech-slate mt-1">
              Protected by Pause Saver™ Auto-Resume Safety Net
            </p>
          </>
        )}
      </div>

      {/* Safety Net Pillars */}
      <div className="space-y-3.5 mb-7">
        <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-5 space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal shrink-0 mt-0.5">
              <Calendar className="w-4.5 h-4.5 text-fintech-teal stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[14.5px] font-bold text-fintech-navy block">
                {isContinue ? 'Regular Debit: 5 Nov 2026' : `Auto-resumes on ${autoResumeDate}`}
              </span>
              <p className="text-[12.5px] text-fintech-slate mt-0.5 font-medium leading-relaxed">
                {isContinue 
                  ? 'Your automatic debit schedule continues without interruption.' 
                  : 'Zero manual reactivation needed. Your SIP resumes smoothly to maintain your financial discipline.'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 pt-3.5 border-t border-[#DCE5EE]">
            <div className="w-9 h-9 rounded-[10px] bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal shrink-0 mt-0.5">
              <Bell className="w-4.5 h-4.5 text-fintech-teal stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[14.5px] font-bold text-fintech-navy block">
                Reminder 7 days before
              </span>
              <p className="text-[12.5px] text-fintech-slate mt-0.5 font-medium leading-relaxed">
                We will notify you via WhatsApp & SMS with 1-click controls to modify or extend if needed.
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Protection Alert Card Preview */}
        {!isContinue && (
          <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[14px] p-4 relative shadow-subtle">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-fintech-teal text-white flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-bold text-fintech-navy">
                    Protection Alert Preview
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-fintech-teal border border-fintech-teal/20">
                    7-Day Notice
                  </span>
                </div>
                <p className="text-[12px] text-fintech-navyMuted mt-1 leading-relaxed">
                  “Your SIP restarts in 7 days ({autoResumeDate}). You can modify, extend, or keep running as planned.”
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-5 border-t border-[#EDF2F7] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Done Button */}
          <button
            type="button"
            onClick={onDone}
            className="h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all flex items-center justify-center shadow-subtle active:scale-[0.99] cursor-pointer"
          >
            <span>Done</span>
          </button>

          {/* Change dates Button */}
          <button
            type="button"
            onClick={onChangeDates}
            className="h-[46px] rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[14.5px] transition-all flex items-center justify-center active:scale-[0.99] cursor-pointer"
          >
            <span>Change options</span>
          </button>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] font-medium text-fintech-slate hover:text-fintech-navy transition-colors inline-flex items-center space-x-1.5 cursor-pointer py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart demo flow</span>
          </button>
        </div>
      </div>
    </div>
  );
};
