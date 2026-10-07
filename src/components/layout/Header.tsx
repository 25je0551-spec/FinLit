import React, { useState } from 'react';
import { 
  Bell, 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import type { InvestorProfile, IntentId } from '../../types';

interface HeaderProps {
  investor: InvestorProfile;
  currentStepTitle: string;
  onReset: () => void;
  selectedIntent?: IntentId;
  onSelectIntent?: (intent: IntentId) => void;
  onSelectScenario?: (scenario: 'market' | 'cash' | 'default') => void;
  activeScenario?: 'market' | 'cash' | 'default';
  currentTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  investor, 
  onReset,
  selectedIntent = 'market_fear',
  onSelectIntent,
  currentTab = 'sips',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const isInvestmentsTab = currentTab === 'investments';

  return (
    <header className="h-16 bg-white border-b border-[#DCE5EE] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs & Current context */}
      <div className="flex items-center space-x-2.5 text-[13.5px]">
        <span className="text-fintech-slate font-medium">Investments</span>
        <ChevronRight className="w-3.5 h-3.5 text-fintech-lightSlate" />
        {currentTab === 'portfolio' ? (
          <span className="text-fintech-navy font-bold flex items-center space-x-2">
            <span>Portfolio Holdings</span>
            <span className="bg-fintech-tealLight text-fintech-teal text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-fintech-teal/20">
              3 ASSETS • LIVE
            </span>
          </span>
        ) : currentTab === 'goals' ? (
          <span className="text-fintech-navy font-bold flex items-center space-x-2">
            <span>Goal Milestones</span>
            <span className="bg-fintech-tealLight text-fintech-teal text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-fintech-teal/20">
              CUSTOM TARGETS
            </span>
          </span>
        ) : isInvestmentsTab ? (
          <span className="text-fintech-navy font-bold flex items-center space-x-2">
            <span>Market Equities</span>
            <span className="bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              NSE / BSE
            </span>
          </span>
        ) : (
          <>
            <span className="text-fintech-slate font-medium">SIPs</span>
            <ChevronRight className="w-3.5 h-3.5 text-fintech-lightSlate" />
            <span className="text-fintech-navy font-bold flex items-center space-x-2">
              <span>Flexi Cap Fund (Direct)</span>
              <span className="bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </span>
          </>
        )}
      </div>

      {/* Middle: Status Pill */}
      <div className="hidden xl:flex items-center space-x-2 bg-fintech-tealLight border border-fintech-teal/20 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-fintech-teal">
        <Sparkles className="w-3.5 h-3.5 text-fintech-teal stroke-[2.2]" />
        <span>{isInvestmentsTab ? 'Real Market Data Feed' : 'Pause Saver™ Active Protection'}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-fintech-teal"></span>
        <span className="text-fintech-navy font-normal text-[11.5px]">
          {isInvestmentsTab ? 'NSE Official Quote API' : 'Zero Lock-in'}
        </span>
      </div>

      {/* Right: Scenarios Segmented Controls, Reset & Profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Intent Switcher */}
        {onSelectIntent && (
          <div className="hidden md:flex items-center bg-[#F0F5FA] p-1 rounded-[10px] border border-[#DCE5EE] text-[12px]">
            <span className="px-2 text-[11px] font-bold text-fintech-slate uppercase tracking-wider">Demo:</span>
            <button
              onClick={() => onSelectIntent('market_fear')}
              className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all cursor-pointer ${
                selectedIntent === 'market_fear' 
                  ? 'bg-white text-fintech-teal shadow-subtle' 
                  : 'text-fintech-slate hover:text-fintech-navy'
              }`}
            >
              Market Panic
            </button>
            <button
              onClick={() => onSelectIntent('cash_need')}
              className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all cursor-pointer ${
                selectedIntent === 'cash_need' 
                  ? 'bg-white text-fintech-teal shadow-subtle' 
                  : 'text-fintech-slate hover:text-fintech-navy'
              }`}
            >
              Cash Need
            </button>
            <button
              onClick={() => onSelectIntent('performance_doubt')}
              className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all cursor-pointer hidden lg:inline-block ${
                selectedIntent === 'performance_doubt' 
                  ? 'bg-white text-fintech-teal shadow-subtle' 
                  : 'text-fintech-slate hover:text-fintech-navy'
              }`}
            >
              Plan Doubt
            </button>
          </div>
        )}

        {/* Compact Reset button */}
        <button
          onClick={onReset}
          title="Reset Flow to Step 1"
          className="h-[34px] flex items-center space-x-1.5 px-3 rounded-[10px] border border-[#DCE5EE] text-[12px] font-semibold text-fintech-navy hover:bg-[#F5F8FA] transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-[34px] h-[34px] rounded-[10px] text-fintech-slate hover:text-fintech-navy hover:bg-[#F0F5FA] flex items-center justify-center transition-all relative cursor-pointer"
            title="Safety Net Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fintech-teal ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-76 bg-white rounded-[16px] shadow-card border border-[#DCE5EE] p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDF2F7] mb-2.5">
                <span className="text-[11.5px] font-bold text-fintech-navy uppercase tracking-wider">Safety Net Active</span>
                <span className="text-[10.5px] text-fintech-teal font-bold">1 Alert</span>
              </div>
              <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[12px] p-3 text-[12px]">
                <div className="flex items-center space-x-1.5 text-fintech-teal font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-Resume Protected</span>
                </div>
                <p className="text-fintech-navyMuted text-[11px] leading-relaxed">
                  Your SIPs are protected with 7-day advance reminder alerts before resumption.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center space-x-2.5 pl-2.5 border-l border-[#DCE5EE]">
          <div className="w-8 h-8 rounded-full bg-fintech-navy text-white text-[12px] font-bold flex items-center justify-center">
            RM
          </div>
          <span className="text-[13px] font-semibold text-fintech-navy hidden lg:inline-block">
            {investor.name}
          </span>
        </div>
      </div>
    </header>
  );
};
