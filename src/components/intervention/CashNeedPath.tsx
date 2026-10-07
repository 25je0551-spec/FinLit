import React, { useState } from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Calendar, 
  Info, 
  ChevronRight, 
  Check 
} from 'lucide-react';

import type { GoalDetails } from '../../types';

interface CashNeedPathProps {
  goal?: GoalDetails;
  onConfirm: (choice: 'reduce' | 'pause-3' | 'modify-other') => void;
  onBack: () => void;
  onContinueWithoutThis: () => void;
}

export const CashNeedPath: React.FC<CashNeedPathProps> = ({
  goal,
  onConfirm,
  onBack,
  onContinueWithoutThis,
}) => {
  const [selectedAction, setSelectedAction] = useState<'reduce' | 'pause-3'>('pause-3');
  const reducedAmt = Math.round((goal?.monthlyContribution || 4000) * 0.5);

  return (
    <div className="w-full bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-7 sm:p-8 animate-fade-in text-left">
      {/* Top Header Navigation */}
      <div className="flex items-center space-x-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 -ml-1 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-navy transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-fintech-navy stroke-[2.2]" />
        </button>
        <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Emergency Cash Relief • No Guilt
        </span>
      </div>

      {/* Headings */}
      <div className="mb-6">
        <h2 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight leading-tight">
          Need the money?
        </h2>
        <p className="text-[17px] sm:text-[18px] font-semibold text-fintech-navy mt-1">
          That’s okay — we’ll keep it quick.
        </p>
      </div>

      {/* 2x2 Grid of Cash Need Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
        {/* Card 1: Reduce amount */}
        <div
          onClick={() => setSelectedAction('reduce')}
          className={`min-h-[72px] p-4 rounded-[14px] border flex items-center justify-between transition-all duration-150 cursor-pointer select-none ${
            selectedAction === 'reduce'
              ? 'bg-fintech-tealLight border-fintech-teal ring-1.5 ring-fintech-teal shadow-subtle'
              : 'bg-white border-[#DCE5EE] hover:border-[#B8CDDC] hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
              selectedAction === 'reduce' ? 'bg-white border-fintech-teal/30 shadow-subtle' : 'bg-[#F8FAFC] border-[#DCE5EE]'
            }`}>
              <SlidersHorizontal className="w-5 h-5 text-fintech-navy stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[14.5px] font-bold text-fintech-navy block truncate">
                Reduce amount
              </span>
              <span className="text-[12px] text-fintech-slate block truncate font-normal">
                Drop to ₹{reducedAmt.toLocaleString('en-IN')}/mo temporarily
              </span>
            </div>
          </div>

          {selectedAction === 'reduce' && (
            <div className="w-5 h-5 rounded-full bg-fintech-teal text-white flex items-center justify-center shrink-0 ml-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Card 2: Pause 1 to 3 months with auto-resume */}
        <div
          onClick={() => setSelectedAction('pause-3')}
          className={`min-h-[72px] p-4 rounded-[14px] border flex items-center justify-between transition-all duration-150 cursor-pointer select-none ${
            selectedAction === 'pause-3'
              ? 'bg-fintech-tealLight border-fintech-teal ring-1.5 ring-fintech-teal shadow-subtle'
              : 'bg-white border-[#DCE5EE] hover:border-[#B8CDDC] hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
              selectedAction === 'pause-3' ? 'bg-white border-fintech-teal/30 shadow-subtle' : 'bg-[#F8FAFC] border-[#DCE5EE]'
            }`}>
              <Calendar className="w-5 h-5 text-fintech-navy stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[14.5px] font-bold text-fintech-navy block truncate leading-tight">
                Pause 1 to 3 months
              </span>
              <span className="text-[12px] font-semibold text-fintech-teal block truncate mt-0.5">
                with auto-resume
              </span>
            </div>
          </div>

          {selectedAction === 'pause-3' && (
            <div className="w-5 h-5 rounded-full bg-fintech-teal text-white flex items-center justify-center shrink-0 ml-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Card 3: Impact info notice */}
        <div className="min-h-[72px] p-4 rounded-[14px] bg-[#F8FAFC] border border-[#DCE5EE] flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal shrink-0">
            <Info className="w-4 h-4 text-fintech-teal stroke-[2.3]" />
          </div>
          <span className="text-[13px] font-medium text-fintech-navy leading-snug">
            Pausing 3 months moves your goal by about 2 months.
          </span>
        </div>

        {/* Card 4: Modify another SIP */}
        <div 
          onClick={() => onConfirm('modify-other')}
          className="min-h-[72px] p-4 rounded-[14px] bg-white border border-[#DCE5EE] hover:border-[#B8CDDC] flex items-center justify-between cursor-pointer group transition-colors select-none"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[14.5px] font-bold text-fintech-navy group-hover:text-fintech-teal transition-colors block truncate">
              Modify another SIP
            </span>
            <span className="text-[12px] text-fintech-slate block truncate">
              {goal ? `Protect your ${goal.name} goal` : 'Protect your primary goal'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-fintech-navy group-hover:translate-x-0.5 transition-transform stroke-[2.4] shrink-0" />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-5 border-t border-[#EDF2F7] space-y-3">
        <button
          type="button"
          onClick={() => onConfirm(selectedAction)}
          className="w-full h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all flex items-center justify-center shadow-subtle active:scale-[0.99] cursor-pointer"
        >
          <span>Confirm {selectedAction === 'pause-3' ? '3-Month Pause' : 'Amount Reduction'}</span>
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onContinueWithoutThis}
            className="text-[13.5px] font-medium text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer py-1 hover:underline"
          >
            Continue without auto-resume
          </button>
        </div>
      </div>
    </div>
  );
};
