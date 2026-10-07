import React from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  TrendingUp, 
  Target
} from 'lucide-react';
import type { SIPDetails, GoalDetails } from '../../types';

interface SIPDetailCardProps {
  sip: SIPDetails;
  goal: GoalDetails;
  onPauseClick: () => void;
  onModifyClick: () => void;
  isPaused?: boolean;
  pauseDetails?: {
    untilDate: string;
    optionTitle?: string;
  };
}

export const SIPDetailCard: React.FC<SIPDetailCardProps> = ({
  sip,
  goal,
  onPauseClick,
  onModifyClick,
  isPaused = false,
  pauseDetails,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4.5 animate-fade-in text-left">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-3">
          <button 
            className="w-9 h-9 -ml-1 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-navy transition-colors cursor-pointer"
            title="Back to all SIPs"
          >
            <ArrowLeft className="w-5.5 h-5.5 text-fintech-navy stroke-[2.2]" />
          </button>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-fintech-navy tracking-tight">
            SIP detail
          </h1>
        </div>

        {isPaused ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Paused until {pauseDetails?.untilDate || '5 Feb 2027'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Active</span>
          </span>
        )}
      </div>

      {/* Fund Selector Card */}
      <div 
        onClick={onModifyClick}
        className="bg-white border border-[#DCE5EE] hover:border-[#B8CDDC] rounded-[16px] px-6 py-4.5 flex items-center justify-between shadow-subtle transition-all cursor-pointer group"
      >
        <span className="text-[16.5px] font-bold text-fintech-navy group-hover:text-fintech-teal transition-colors">
          {sip.fundName}
        </span>
        <ChevronRight className="w-5 h-5 text-fintech-navy group-hover:translate-x-0.5 transition-transform stroke-[2.4]" />
      </div>

      {/* Main SIP & History Box */}
      <div className="bg-white border border-[#DCE5EE] rounded-[20px] p-7 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
          {/* Left Column: SIP Stats */}
          <div className="md:col-span-7 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-[12px] bg-fintech-tealLight border border-fintech-teal/20 flex items-center justify-center text-fintech-teal shadow-subtle shrink-0 mt-0.5">
              <TrendingUp className="w-6 h-6 text-fintech-teal stroke-[2.3]" />
            </div>
            <div className="space-y-1">
              <span className="text-[12.5px] font-bold text-fintech-slate block uppercase tracking-wider">
                SIP
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[30px] font-extrabold text-fintech-navy tracking-tight leading-none">
                  ₹{sip.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[14px] font-medium text-fintech-slate">/ month</span>
              </div>
              <p className="text-[13.5px] font-semibold text-fintech-navy pt-1">
                Next debit {isPaused ? pauseDetails?.untilDate || '5 Feb' : sip.nextDebitDate}
              </p>
            </div>
          </div>

          {/* Divider on desktop */}
          <div className="hidden md:block w-px h-20 bg-[#DCE5EE] -mx-2"></div>

          {/* Right Column: Recent SIP History */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-[13.5px] font-bold text-fintech-navy tracking-tight mb-2">
              Recent SIP History
            </div>
            <div className="space-y-1.5 text-[13.5px]">
              {(sip.history && sip.history.length > 0 ? sip.history : [
                { amount: sip.amount, date: '5 Oct', status: 'Completed' },
                { amount: sip.amount, date: '5 Sep', status: 'Completed' },
                { amount: sip.amount, date: '5 Aug', status: 'Completed' },
              ]).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-fintech-navy py-0.5">
                  <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                  <span className="text-fintech-slate font-medium">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Information Card */}
      <div className="bg-white border border-[#DCE5EE] rounded-[16px] px-6 py-4 flex items-center justify-between shadow-subtle">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-fintech-tealLight border border-fintech-teal/20 flex items-center justify-center text-fintech-teal shrink-0">
            <Target className="w-4 h-4 text-fintech-teal stroke-[2.3]" />
          </div>
          <span className="text-[14.5px] font-bold text-fintech-navy">
            Goal: {goal.targetAmount >= 100000 ? `${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)}L` : `₹${goal.targetAmount.toLocaleString('en-IN')}`} • {goal.targetDate}
          </span>
        </div>

        <span className="text-[11.5px] font-bold text-fintech-teal bg-fintech-tealLight px-2.5 py-0.5 rounded-full border border-fintech-teal/20">
          {goal.name} • {goal.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 grid grid-cols-2 gap-3.5">
        {/* Pause SIP Button (Solid Teal) */}
        <button
          onClick={onPauseClick}
          className="h-[48px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[15px] transition-all duration-150 shadow-subtle hover:shadow flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
        >
          <span>{isPaused ? 'Review / Unpause' : 'Pause SIP'}</span>
        </button>

        {/* Modify Button (Secondary Light Button) */}
        <button
          onClick={onModifyClick}
          className="h-[48px] rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[15px] transition-all duration-150 flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
        >
          <span>Modify</span>
        </button>
      </div>

      {/* Interactive Helper Caption */}
      <div className="text-center pt-2">
        <p className="text-[12.5px] text-fintech-slate font-medium">
          Rohan taps <span className="font-bold text-fintech-navy">Pause SIP</span> to experience the proactive AI intervention.
        </p>
      </div>
    </div>
  );
};
