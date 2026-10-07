import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Target, 
  ArrowRight
} from 'lucide-react';
import type { SIPDetails, GoalDetails, IntentId } from '../../types';
import { getIntentConfig } from '../../data/intentConfigs';
import { 
  getHistoricalMarketAnalysis, 
  HistoricalMarketAnalysisResult 
} from '../../services/historicalMarketService';
import { MarketHistoricalContextCard } from './MarketHistoricalContextCard';
import { MarketPersonalizedScenarios } from './MarketPersonalizedScenarios';

interface GoalImpactViewProps {
  sip: SIPDetails;
  goal: GoalDetails;
  selectedIntent: IntentId;
  onProceedToModifications: (customOptionId?: string) => void;
  onAcknowledgeAndProceed: () => void;
  onContinueWithoutThis: () => void;
  onBack: () => void;
  onUpdateIntentState?: (stateData: any) => void;
}

export const GoalImpactView: React.FC<GoalImpactViewProps> = ({
  sip,
  goal,
  selectedIntent,
  onProceedToModifications,
  onAcknowledgeAndProceed,
  onContinueWithoutThis,
  onBack,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showPlanHealth, setShowPlanHealth] = useState(false);

  // Intent 1: Cash Need State
  const [cashFlexibilityAmount, setCashFlexibilityAmount] = useState<number>(() => Math.round((goal.monthlyContribution || sip.amount || 4000) * 0.5));

  // Intent 2: Market Fear State (Pause duration & Historical Data)
  const [marketPauseMonths, setMarketPauseMonths] = useState<number>(6);
  const [marketAnalysis, setMarketAnalysis] = useState<HistoricalMarketAnalysisResult | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const loadMarketData = async () => {
    if (selectedIntent !== 'market_fear') return;
    setIsLoadingMarket(true);
    setMarketError(null);
    try {
      const data = await getHistoricalMarketAnalysis(
        goal,
        goal.monthlyContribution || sip.amount || 4000,
        marketPauseMonths
      );
      setMarketAnalysis(data);
    } catch (err: any) {
      console.error('Failed to load historical market analysis:', err);
      setMarketError(err?.message || 'Historical market context is temporarily unavailable.');
    } finally {
      setIsLoadingMarket(false);
    }
  };

  useEffect(() => {
    if (selectedIntent === 'market_fear') {
      loadMarketData();
    }
  }, [selectedIntent, goal.id, goal.monthlyContribution, marketPauseMonths]);

  // Intent 3: Performance Doubt State (What feels off)
  const [doubtReason, setDoubtReason] = useState<string>('Returns seem low');

  // Intent 4: Goal Change State
  const [goalChangeType, setGoalChangeType] = useState<string>('New target amount');
  const [customTargetAmount, setCustomTargetAmount] = useState<number>(600000); // 6 Lakh

  const config = getIntentConfig(selectedIntent, goal);

  // Calculations for Market Fear
  const marketGap = marketPauseMonths * sip.amount;
  const marketDelay = marketPauseMonths === 0 ? 0 : marketPauseMonths === 1 ? 1 : marketPauseMonths === 3 ? 2 : 5;
  const getMarketProjectedDate = (months: number) => {
    if (months === 0) return goal.targetDate;
    const [mStr, yStr] = goal.targetDate.split(' ');
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = mNames.indexOf(mStr) !== -1 ? mNames.indexOf(mStr) : 2;
    const yVal = parseInt(yStr, 10) || 2029;
    const d = new Date(yVal, mIdx + (months === 1 ? 1 : months === 3 ? 2 : 5), 1);
    return `${mNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Calculations for Cash Need
  const cashFreed = cashFlexibilityAmount;
  const cashGap = cashFlexibilityAmount;
  const monthlySip = goal.monthlyContribution || sip.amount || 4000;
  const cashDelayMonths = cashFlexibilityAmount >= monthlySip ? 1 : 0;

  return (
    <div className="w-full bg-white rounded-[22px] border border-[#DCE5EE] shadow-card p-7 sm:p-8 animate-fade-in text-left space-y-6">
      {/* 1. Header with Back button & Personalization Pill */}
      <div className="flex items-center justify-between pb-1 border-b border-[#EDF2F7]">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 -ml-1 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-navy transition-colors cursor-pointer"
            title="Back to intent check"
          >
            <ArrowLeft className="w-5 h-5 text-fintech-navy stroke-[2.2]" />
          </button>
          <h2 className="text-[22px] sm:text-[24px] font-bold text-fintech-navy tracking-tight">
            Goal Impact & Context
          </h2>
        </div>

        <span className="text-[11.5px] font-bold text-fintech-teal bg-fintech-tealLight border border-fintech-teal/20 px-3 py-1 rounded-full">
          Personalized for: {config.label}
        </span>
      </div>

      {/* 2. Top AI Context Insight Banner */}
      <div className="bg-[#EEF8F8] border border-[#CDEAEB] rounded-[14px] p-4 flex items-start space-x-3 shadow-subtle">
        <Sparkles className="w-5 h-5 text-fintech-teal shrink-0 mt-0.5 stroke-[2.2]" />
        <div className="text-[13px] text-fintech-navy leading-relaxed">
          <span className="font-bold text-fintech-navy block mb-0.5">
            Pause Saver AI Context Analysis:
          </span>
          {config.aiInsightMessage}
        </div>
      </div>

      {/* 3. Main Intent-Specific Body */}
      
      {/* ===================== PATH 1: CASH NEED ===================== */}
      {selectedIntent === 'cash_need' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight leading-snug">
              {config.headline}
            </h3>
            <p className="text-[13.5px] text-fintech-slate mt-1 leading-relaxed">
              {config.supportingCopy}
            </p>
          </div>

          {/* Current Plan Summary Card */}
          <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4.5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fintech-slate block">
              Your Current Plan
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-fintech-slate block">Current SIP</span>
                <span className="text-[14px] font-bold text-fintech-navy">₹{monthlySip.toLocaleString('en-IN')} / month</span>
              </div>
              <div>
                <span className="text-[11px] text-fintech-slate block">Goal</span>
                <span className="text-[14px] font-bold text-fintech-navy">{goal.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-fintech-slate block">Target Amount</span>
                <span className="text-[14px] font-bold text-fintech-navy">₹{(goal.targetAmount / 100000).toFixed(1)} Lakh</span>
              </div>
              <div>
                <span className="text-[11px] text-fintech-slate block">Target Date</span>
                <span className="text-[14px] font-bold text-fintech-navy">{goal.targetDate}</span>
              </div>
            </div>
          </div>

          {/* Cash Flexibility Selector */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-fintech-navy">
                How much monthly cash flexibility do you need?
              </span>
              <span className="text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Instant relief
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                Math.round(monthlySip * 0.25),
                Math.round(monthlySip * 0.5),
                Math.round(monthlySip * 0.75),
                monthlySip
              ].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setCashFlexibilityAmount(amount)}
                  className={`py-2.5 px-3 rounded-[10px] text-[13px] font-bold border transition-all cursor-pointer ${
                    cashFlexibilityAmount === amount
                      ? 'bg-fintech-teal text-white border-fintech-teal shadow-subtle'
                      : 'bg-[#F8FAFC] text-fintech-navy border-[#DCE5EE] hover:bg-[#F0F5FA]'
                  }`}
                >
                  ₹{amount.toLocaleString('en-IN')}/mo
                </button>
              ))}
            </div>

            {/* Impact Readout */}
            <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[12px] p-4 text-[13px] space-y-1.5">
              <div className="flex justify-between items-center text-fintech-navy font-semibold">
                <span>Cash freed in your pocket this month:</span>
                <span className="text-emerald-700 font-bold text-[15px]">
                  +₹{cashFreed.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-fintech-slate text-[12px]">
                <span>Estimated contribution gap:</span>
                <span className="font-medium text-fintech-navy">₹{cashGap.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-fintech-slate text-[12px]">
                <span>Projected goal delay impact:</span>
                <span className="font-bold text-fintech-teal">
                  {cashDelayMonths === 0 ? 'Minimal (~0 months delay)' : '~0–1 month shift'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PATH 2: MARKET FEAR ===================== */}
      {selectedIntent === 'market_fear' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight leading-snug">
              {config.headline}
            </h3>
            <p className="text-[13.5px] text-fintech-slate mt-1 leading-relaxed">
              {config.supportingCopy}
            </p>
          </div>

          {/* 1. Goal Impact Assessment Summary Card */}
          <div className="bg-[#FAFBFD] rounded-[18px] border border-[#DCE5EE] p-5 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-teal">
                Goal Impact Assessment
              </span>
              <span className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                marketPauseMonths === 0
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-600 bg-rose-50 border-rose-200'
              }`}>
                {marketPauseMonths === 0 ? 'On Track' : `+${marketDelay} mo estimated delay`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Primary Goal</span>
                <span className="text-[13.5px] font-bold text-fintech-navy truncate block">{goal.name}</span>
                <span className="text-[10.5px] text-fintech-teal">Target: ₹{(goal.targetAmount / 100000).toFixed(1)}L</span>
              </div>
              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Original Date</span>
                <span className="text-[13.5px] font-bold text-emerald-700 block">{goal.targetDate}</span>
                <span className="text-[10.5px] text-fintech-slate">{goal.monthsRemaining || 30} months left</span>
              </div>
              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Projected Date</span>
                <span className={`text-[13.5px] font-bold block ${marketPauseMonths === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {getMarketProjectedDate(marketPauseMonths)}
                </span>
                <span className="text-[10.5px] text-amber-900/80">With {marketPauseMonths}m pause</span>
              </div>
              <div className="bg-white p-3 rounded-[12px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Contribution Gap</span>
                <span className="text-[13.5px] font-bold text-rose-600 block">
                  ₹{marketGap.toLocaleString('en-IN')}
                </span>
                <span className="text-[10.5px] text-fintech-slate">₹{monthlySip.toLocaleString('en-IN')}/mo SIP</span>
              </div>
            </div>

            {/* Quick pause duration selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#EDF2F7]">
              <span className="text-[12px] font-semibold text-fintech-slate">
                Hypothetical pause duration to evaluate:
              </span>
              <div className="flex items-center space-x-1.5">
                {[0, 1, 3, 6].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarketPauseMonths(m)}
                    className={`px-3 py-1 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                      marketPauseMonths === m
                        ? 'bg-fintech-teal text-white shadow-subtle'
                        : 'bg-white text-fintech-navy border border-[#DCE5EE] hover:bg-[#F0F5FA]'
                    }`}
                  >
                    {m === 0 ? '0m (Keep)' : `${m}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Historical Context AI Card (Sections 1 to 9 & 14, 15) */}
          <MarketHistoricalContextCard
            currentMarket={marketAnalysis?.currentMarket || null}
            episodes={marketAnalysis?.comparableEpisodes || []}
            aiExplanation={marketAnalysis?.aiExplanation || null}
            isLoading={isLoadingMarket}
            error={marketError}
            goal={goal}
            sipAmount={monthlySip}
            pauseMonths={marketPauseMonths}
            onRetry={loadMarketData}
          />

          {/* 3. Personalized SIP Impact Scenarios (Sections 10 & 11) */}
          <MarketPersonalizedScenarios
            goal={goal}
            sipAmount={monthlySip}
            pauseMonths={marketPauseMonths}
            onSelectOption={(optId) => onProceedToModifications(optId)}
            onProceedWithOption={(optId) => onProceedToModifications(optId)}
          />
        </div>
      )}

      {/* ===================== PATH 3: PERFORMANCE DOUBT ===================== */}
      {selectedIntent === 'performance_doubt' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight leading-snug">
              {config.headline}
            </h3>
            <p className="text-[13.5px] text-fintech-slate mt-1 leading-relaxed">
              {config.supportingCopy}
            </p>
          </div>

          {/* Performance & Consistency Panel */}
          <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fintech-navy">
                Portfolio Plan Health Summary
              </span>
              <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                14.8% XIRR • On Track
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">SIP Started</span>
                <span className="text-[13px] font-bold text-fintech-navy">Nov 2024 (24 debits)</span>
              </div>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Total Invested</span>
                <span className="text-[13px] font-bold text-fintech-navy">₹{sip.totalInvested.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Current Value</span>
                <span className="text-[13px] font-bold text-emerald-700">₹{goal.currentSavings.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Goal Progress</span>
                <span className="text-[13px] font-bold text-fintech-navy">
                  {((goal.currentSavings / (goal.targetAmount || 1)) * 100).toFixed(1)}% of {goal.targetAmount >= 100000 ? `₹${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)}L` : `₹${goal.targetAmount.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Toggleable Deep Plan Health Drawer */}
            <button
              type="button"
              onClick={() => setShowPlanHealth(!showPlanHealth)}
              className="w-full text-center py-2 text-[12.5px] font-bold text-fintech-teal hover:underline cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>{showPlanHealth ? 'Hide plan audit details' : 'See deep plan health audit'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPlanHealth ? 'rotate-180' : ''}`} />
            </button>

            {showPlanHealth && (
              <div className="bg-white p-4 rounded-[12px] border border-[#DCE5EE] text-[12px] text-fintech-navy space-y-2 animate-fade-in">
                <div className="flex justify-between">
                  <span className="text-fintech-slate">Contribution Consistency:</span>
                  <span className="font-bold text-emerald-700">100% (24/24 on time)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fintech-slate">Benchmark Model:</span>
                  <span className="font-bold text-fintech-navy">12% assumed CAGR (Outperforming by +2.8%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fintech-slate">Remaining Horizon:</span>
                  <span className="font-bold text-fintech-navy">
                    {goal.monthsRemaining || 30} months remaining to {goal.targetDate}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic: What feels off? */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-3 shadow-subtle">
            <span className="text-[13.5px] font-bold text-fintech-navy block">
              What feels off about your plan?
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Returns seem low',
                'Goal feels too far away',
                'SIP amount feels high',
                'I want a different fund',
                "I'm not sure",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDoubtReason(reason)}
                  className={`px-3 py-2 rounded-[10px] text-[12.5px] font-semibold border transition-all cursor-pointer ${
                    doubtReason === reason
                      ? 'bg-fintech-tealLight text-fintech-teal border-fintech-teal ring-1 ring-fintech-teal'
                      : 'bg-[#F8FAFC] text-fintech-navy border-[#DCE5EE] hover:bg-[#F0F5FA]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== PATH 4: GOAL CHANGE ===================== */}
      {selectedIntent === 'goal_change' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight leading-snug">
              {config.headline}
            </h3>
            <p className="text-[13.5px] text-fintech-slate mt-1 leading-relaxed">
              {config.supportingCopy}
            </p>
          </div>

          {/* Current Goal Anchor */}
          <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-4.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white border border-[#DCE5EE] flex items-center justify-center text-fintech-teal">
                <Target className="w-4.5 h-4.5 text-fintech-teal stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[14px] font-bold text-fintech-navy block">
                  Original Goal: {goal.name}
                </span>
                <span className="text-[12px] text-fintech-slate font-medium">
                  ₹{goal.targetAmount.toLocaleString('en-IN')} target by {goal.targetDate}
                </span>
              </div>
            </div>
            <span className="text-[11.5px] font-bold text-fintech-teal bg-white px-2.5 py-1 rounded-full border border-[#DCE5EE]">
              Active Target
            </span>
          </div>

          {/* Selector: What's changing? */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-3.5 shadow-subtle">
            <span className="text-[13.5px] font-bold text-fintech-navy block">
              What is changing with your goal?
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'New target amount',
                'New target date',
                'Different goal',
                'Switching investment',
                'Goal completed',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGoalChangeType(type)}
                  className={`px-3 py-2 rounded-[10px] text-[12.5px] font-semibold border transition-all cursor-pointer ${
                    goalChangeType === type
                      ? 'bg-fintech-tealLight text-fintech-teal border-fintech-teal ring-1 ring-fintech-teal'
                      : 'bg-[#F8FAFC] text-fintech-navy border-[#DCE5EE] hover:bg-[#F0F5FA]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Recalibration interactive field */}
            {goalChangeType === 'New target amount' && (
              <div className="mt-3 p-4 bg-[#F8FAFC] rounded-[12px] border border-[#DCE5EE] space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="font-semibold text-fintech-navy">Adjust new target amount:</span>
                  <span className="font-bold text-fintech-teal text-[14px]">
                    ₹{(customTargetAmount / 100000).toFixed(1)} Lakh
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[500000, 600000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomTargetAmount(amt)}
                      className={`py-1.5 px-2 rounded-[8px] text-[12px] font-bold border transition-colors ${
                        customTargetAmount === amt
                          ? 'bg-fintech-teal text-white border-fintech-teal'
                          : 'bg-white text-fintech-navy border-[#DCE5EE]'
                      }`}
                    >
                      ₹{amt / 100000} Lakh
                    </button>
                  ))}
                </div>
                <p className="text-[11.5px] text-fintech-slate pt-1 leading-tight">
                  Your current SIP of ₹{(goal.monthlyContribution || sip.amount).toLocaleString('en-IN')}/mo can be adjusted down to match this new target instead of pausing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== PATH 5: JUST CHECKING ===================== */}
      {selectedIntent === 'just_checking' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy tracking-tight leading-snug">
              {config.headline}
            </h3>
            <p className="text-[13.5px] text-fintech-slate mt-1 leading-relaxed">
              {config.supportingCopy}
            </p>
          </div>

          {/* Quick Snapshot Card */}
          <div className="bg-[#F8FAFC] border border-[#DCE5EE] rounded-[16px] p-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fintech-slate block">
              Quick Plan Status
            </span>
            <div className="grid grid-cols-3 gap-3 text-[12.5px]">
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block">Monthly SIP</span>
                <span className="text-[14px] font-bold text-fintech-navy">₹{(goal.monthlyContribution || sip.amount).toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block">Target Goal</span>
                <span className="text-[14px] font-bold text-fintech-navy truncate">
                  {goal.targetAmount >= 100000 ? `₹${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)}L` : `₹${goal.targetAmount.toLocaleString('en-IN')}`} ({goal.name})
                </span>
              </div>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block">Target Date</span>
                <span className="text-[14px] font-bold text-emerald-700">{goal.targetDate} ({goal.status})</span>
              </div>
            </div>
          </div>

          {/* Hypothetical 1-Month Pause Impact */}
          <div className="bg-white border border-[#DCE5EE] rounded-[16px] p-5 space-y-2 shadow-subtle">
            <span className="text-[13.5px] font-bold text-fintech-navy block">
              If you paused for 1 month...
            </span>
            <div className="grid grid-cols-2 gap-3 text-[12px] pt-1">
              <div className="p-3 bg-[#F8FAFC] rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Contribution Gap</span>
                <span className="text-[14px] font-bold text-fintech-navy">₹{(goal.monthlyContribution || sip.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-[10px] border border-[#DCE5EE]">
                <span className="text-[10.5px] text-fintech-slate block uppercase">Estimated Goal Impact</span>
                <span className="text-[14px] font-bold text-fintech-teal">Minimal (~0–1 month shift)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Adaptive "Why am I seeing this?" Section for other intents */}
      {selectedIntent !== 'market_fear' && (
        <div className="border border-[#DCE5EE] rounded-[12px] overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between p-3.5 text-[13px] font-bold text-fintech-navy hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-fintech-teal stroke-[2.2] shrink-0" />
              <span>Why am I seeing this?</span>
            </div>
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5 text-fintech-slate" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-fintech-slate" />
            )}
          </button>

          {showExplanation && (
            <div className="p-4 pt-0 text-[12px] text-fintech-navyMuted space-y-2 border-t border-[#EDF2F7] bg-[#FAFCFE] animate-fade-in leading-relaxed">
              <p className="font-semibold text-fintech-navy">{config.explainabilityNote}</p>
              <div className="bg-white p-3 rounded-[10px] border border-[#DCE5EE] space-y-1 text-[11.5px]">
                {config.assumptions.map((assump, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-fintech-slate">
                    <span className="w-1.5 h-1.5 rounded-full bg-fintech-teal shrink-0"></span>
                    <span>{assump}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-1.5 text-fintech-teal font-semibold text-[11px] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Projections are estimates for decision support, not personal investment advice.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Action Area (Intent-Specific CTAs) */}
      <div className="pt-5 border-t border-[#EDF2F7] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onProceedToModifications(config.defaultSelectedOptionId)}
            className="h-[46px] rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[14.5px] transition-all flex items-center justify-center space-x-2 shadow-subtle active:scale-[0.99] cursor-pointer"
          >
            <span>{config.primaryActionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            onClick={onAcknowledgeAndProceed}
            className="h-[46px] rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[14.5px] transition-all flex items-center justify-center active:scale-[0.99] cursor-pointer"
          >
            <span>{config.secondaryActionLabel}</span>
          </button>
        </div>

        {/* Continue without this link */}
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
