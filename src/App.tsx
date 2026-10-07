import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SIPDetailCard } from './components/sip/SIPDetailCard';
import { IntentDetection } from './components/intervention/IntentDetection';
import { GoalImpactView } from './components/intervention/GoalImpactView';
import { DecisionLadder } from './components/intervention/DecisionLadder';
import { ConfirmationCard } from './components/intervention/ConfirmationCard';
import { FutureYouSimulator } from './components/intervention/FutureYouSimulator';
import { ProgressIndicator } from './components/common/ProgressIndicator';
import { ToastNotification } from './components/common/ToastNotification';
import { DemoControlBar } from './components/demo/DemoControlBar';
import { InvestmentsMarketplace } from './components/investments/InvestmentsMarketplace';
import { GoalsDashboard } from './components/goals/GoalsDashboard';
import { PortfolioDashboard } from './components/portfolio/PortfolioDashboard';
import { 
  getGoals, 
  getPrimaryGoal, 
  setPrimaryGoal, 
  saveGoal, 
  deleteGoal,
  getLinkedSip,
  getDynamicDecisionOptions
} from './services/goalsService';
import { 
  mockInvestor 
} from './data/mockData';
import { intentConfigurations, intentReasonsList, getIntentConfig } from './data/intentConfigs';
import { StepId, IntentId, DecisionOptionId, DecisionOption, GoalDetails } from './types';
import { 
  Sparkles, 
  Columns, 
  Maximize2, 
  ShieldCheck,
  X,
  Target,
  Repeat,
  TrendingUp
} from 'lucide-react';

export function App() {
  // Navigation & Core States
  const [currentStep, setCurrentStep] = useState<StepId>('sip-detail');
  const [currentTab, setCurrentTab] = useState<string>('sips');
  const [selectedIntent, setSelectedIntent] = useState<IntentId>('market_fear');
  const [selectedOptionId, setSelectedOptionId] = useState<DecisionOptionId>('continue');
  const [isSIPPaused, setIsSIPPaused] = useState<boolean>(false);
  const [pauseDetails, setPauseDetails] = useState<{ untilDate: string; optionTitle?: string }>({
    untilDate: '5 Feb 2027',
    optionTitle: 'Pause with auto-resume',
  });
  const [showToast, setShowToast] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'modal'>('split');
  const [directPauseAlert, setDirectPauseAlert] = useState<string | null>(null);

  // Dynamic Goals State
  const [goals, setGoals] = useState<GoalDetails[]>(() => getGoals());
  const [primaryGoal, setPrimaryGoalInternal] = useState<GoalDetails>(() => getPrimaryGoal());

  const handleMakePrimary = (goalId: string) => {
    const updated = setPrimaryGoal(goalId);
    setPrimaryGoalInternal(updated);
    setGoals(getGoals());
  };

  const handleSaveGoal = (goalToSave: GoalDetails) => {
    const updatedList = saveGoal(goalToSave);
    setGoals(updatedList);
    setPrimaryGoalInternal(getPrimaryGoal());
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedList = deleteGoal(goalId);
    setGoals(updatedList);
    setPrimaryGoalInternal(getPrimaryGoal());
  };

  // Dynamic SIP & Decision Ladder derived strictly from active primary goal
  const currentSip = useMemo(() => getLinkedSip(primaryGoal), [primaryGoal]);
  const currentDecisionOptions = useMemo(() => getDynamicDecisionOptions(primaryGoal), [primaryGoal]);

  // Derived intent configuration & available options
  const config = getIntentConfig(selectedIntent, primaryGoal);
  const availableOptions: DecisionOption[] = config.decisionOptionsOrder
    .map((id) => currentDecisionOptions[id])
    .filter(Boolean);
  const selectedOption: DecisionOption = 
    currentDecisionOptions[selectedOptionId] || availableOptions[0];

  // Handlers for Navigation Flow
  const handleStartIntervention = () => {
    setCurrentTab('sips');
    setCurrentStep('intent-detection');
  };

  const handleReasonSelect = (intentId: IntentId) => {
    setSelectedIntent(intentId);
    const targetConfig = intentConfigurations[intentId];
    if (targetConfig) {
      setSelectedOptionId(targetConfig.defaultSelectedOptionId);
    }
  };

  const handleReasonConfirm = () => {
    setCurrentStep('goal-impact');
  };

  const handleProceedToModifications = (customOptionId?: string) => {
    if (customOptionId && currentDecisionOptions[customOptionId as DecisionOptionId]) {
      setSelectedOptionId(customOptionId as DecisionOptionId);
    }
    setCurrentStep('decision-ladder');
  };

  const handleAcknowledgeAndProceed = () => {
    // User acknowledges impact and proceeds with pause
    const pauseOptionId = selectedIntent === 'cash_need' ? 'pause-3' : 'pause-6';
    const opt = currentDecisionOptions[pauseOptionId];
    setSelectedOptionId(pauseOptionId as DecisionOptionId);
    setPauseDetails({
      untilDate: opt?.autoResumeDate || '5 May 2027',
      optionTitle: opt?.title || 'Pause with auto-resume',
    });
    setIsSIPPaused(true);
    setCurrentStep('confirmation');
    setShowToast(true);
  };

  const handleOptionSelect = (optionId: DecisionOptionId) => {
    setSelectedOptionId(optionId);
  };

  const handleOptionConfirm = () => {
    const opt = currentDecisionOptions[selectedOptionId] || availableOptions[0];
    if (opt.id === 'continue') {
      setIsSIPPaused(false);
      setCurrentStep('confirmation');
    } else if (opt.id === 'reduce-amount' || opt.id === 'reduce-3000' || opt.id === 'step-down') {
      // Amount reduction keeps SIP active with adjusted debit
      setPauseDetails({
        untilDate: opt.autoResumeDate || '5 Feb 2027',
        optionTitle: opt.title,
      });
      setIsSIPPaused(false);
      setCurrentStep('confirmation');
      setShowToast(true);
    } else {
      setPauseDetails({
        untilDate: opt.autoResumeDate || '5 May 2027',
        optionTitle: opt.title,
      });
      setIsSIPPaused(true);
      setCurrentStep('confirmation');
      setShowToast(true);
    }
  };

  const handleContinueWithoutThis = () => {
    // Direct exit: User insists on pausing without AI recommendations
    setIsSIPPaused(true);
    setPauseDetails({
      untilDate: '5 May 2027',
      optionTitle: 'Direct Pause (Standard 6 Months)',
    });
    setCurrentStep('confirmation');
    setDirectPauseAlert('Pause applied directly as requested. No AI nudges enforced.');
    setShowToast(true);
  };

  const handleDone = () => {
    setCurrentStep('sip-detail');
  };

  const handleChangeDates = () => {
    setCurrentStep('decision-ladder');
  };

  const handleReset = () => {
    setCurrentTab('sips');
    setCurrentStep('sip-detail');
    setSelectedIntent('market_fear');
    setSelectedOptionId('continue');
    setIsSIPPaused(false);
    setShowToast(false);
    setDirectPauseAlert(null);
  };

  // Scenario / Intent preset loader
  const handleLoadIntent = (intent: IntentId, targetStep: StepId = 'goal-impact') => {
    setCurrentTab('sips');
    setSelectedIntent(intent);
    const targetConfig = intentConfigurations[intent];
    if (targetConfig) {
      setSelectedOptionId(targetConfig.defaultSelectedOptionId);
    }
    setCurrentStep(targetStep);
    setIsSIPPaused(false);
    setDirectPauseAlert(null);
  };

  // Determine which step component to render in the intervention area
  const renderStepContent = () => {
    switch (currentStep) {
      case 'intent-detection':
        return (
          <IntentDetection
            reasons={intentReasonsList}
            selectedReason={selectedIntent}
            goal={primaryGoal}
            onSelectReason={handleReasonSelect}
            onConfirm={handleReasonConfirm}
            onContinueWithoutThis={handleContinueWithoutThis}
            onBack={() => setCurrentStep('sip-detail')}
          />
        );
      case 'goal-impact':
        return (
          <GoalImpactView
            sip={currentSip}
            goal={primaryGoal}
            selectedIntent={selectedIntent}
            onProceedToModifications={handleProceedToModifications}
            onAcknowledgeAndProceed={handleAcknowledgeAndProceed}
            onContinueWithoutThis={handleContinueWithoutThis}
            onBack={() => setCurrentStep('intent-detection')}
          />
        );
      case 'decision-ladder':
        return (
          <DecisionLadder
            options={availableOptions}
            selectedOptionId={selectedOptionId}
            selectedIntent={selectedIntent}
            goal={primaryGoal}
            onSelectOption={handleOptionSelect}
            onConfirm={handleOptionConfirm}
            onBack={() => setCurrentStep('goal-impact')}
            onContinueWithoutThis={handleContinueWithoutThis}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationCard
            autoResumeDate={pauseDetails.untilDate}
            selectedOption={selectedOption}
            selectedIntent={selectedIntent}
            goal={primaryGoal}
            onDone={handleDone}
            onChangeDates={handleChangeDates}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  const isInterventionActive = currentStep !== 'sip-detail' && currentTab === 'sips';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-fintech-navy flex flex-col font-sans">
      {/* Top Demo Controller Bar for 5 Intent Paths */}
      <DemoControlBar
        onLoadIntent={(intent) => handleLoadIntent(intent, 'goal-impact')}
        onReset={handleReset}
        activeIntent={selectedIntent}
      />

      <div className="flex flex-1">
        {/* Left Sidebar (240px) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          investor={mockInvestor}
          primaryGoalBadge={primaryGoal.name}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header
            investor={mockInvestor}
            currentStepTitle={currentStep}
            onReset={handleReset}
            selectedIntent={selectedIntent}
            onSelectIntent={(intent) => handleLoadIntent(intent, 'goal-impact')}
            currentTab={currentTab}
          />

          {/* Progress Indicator when inside intervention flow */}
          {isInterventionActive && (
            <ProgressIndicator
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          )}

          {/* Page Body Container */}
          <main className="flex-1 p-6 md:p-8 xl:p-10 max-w-[1360px] w-full mx-auto">
            {/* Direct Pause notification banner if triggered */}
            {directPauseAlert && (
              <div className="mb-6 bg-slate-100 border border-slate-300 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                <div className="flex items-center space-x-2 text-xs text-fintech-navy font-semibold">
                  <ShieldCheck className="w-4 h-4 text-fintech-slate" />
                  <span>{directPauseAlert}</span>
                </div>
                <button 
                  onClick={() => setDirectPauseAlert(null)}
                  className="text-fintech-slate hover:text-fintech-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 1: INVESTMENTS (MARKETPLACE) */}
            {currentTab === 'investments' && (
              <InvestmentsMarketplace />
            )}

            {/* TAB 2: SIPS (DEFAULT PAUSE SAVER HERO) */}
            {currentTab === 'sips' && (
              <>
                {/* STEP 1: Default SIP Detail View */}
                {!isInterventionActive && (
                  <div className="animate-fade-in space-y-6">
                    {/* Intro Context Banner */}
                    <div className="bg-white border border-[#DCE5EE] rounded-[20px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card text-left">
                      <div>
                        <div className="flex items-center space-x-2 text-fintech-teal mb-1">
                          <Sparkles className="w-4 h-4 text-fintech-teal" />
                          <span className="text-[11.5px] font-bold uppercase tracking-wider">
                            FinLit Proactive Intelligence
                          </span>
                        </div>
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-fintech-navy">
                          Protecting Your Long-Term Compounding
                        </h2>
                        <p className="text-[13px] text-fintech-slate mt-1 max-w-xl leading-relaxed">
                          Pause Saver™ monitors decisions at the critical moment of intent to help keep your {primaryGoal.targetAmount >= 100000 ? `₹${(primaryGoal.targetAmount / 100000).toFixed(primaryGoal.targetAmount % 100000 === 0 ? 0 : 1)} Lakh` : `₹${primaryGoal.targetAmount.toLocaleString('en-IN')}`} {primaryGoal.name.toLowerCase()} goal on track.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5 bg-[#F8FAFC] px-4 py-2 rounded-full border border-[#DCE5EE] shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${primaryGoal.status === 'On track' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[12px] font-bold text-fintech-navy">
                          Goal Status: {primaryGoal.status} ({primaryGoal.targetDate})
                        </span>
                      </div>
                    </div>

                    {/* The SIP Detail Component */}
                    <SIPDetailCard
                      sip={currentSip}
                      goal={primaryGoal}
                      onPauseClick={handleStartIntervention}
                      onModifyClick={handleStartIntervention}
                      isPaused={isSIPPaused}
                      pauseDetails={pauseDetails}
                    />
                  </div>
                )}

                {/* STEPS 2-5: Proactive AI Intervention Experience */}
                {isInterventionActive && (
                  <div className="animate-fade-in space-y-4">
                    {/* Layout View Toggle (Split vs Centered) for Desktop Presentation */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[12px] font-bold text-fintech-slate uppercase tracking-wider">
                          Pause Saver Intervention Experience
                        </span>
                        <span className="text-[11px] text-fintech-teal font-bold bg-fintech-tealLight border border-fintech-teal/20 px-2.5 py-0.5 rounded-full">
                          {
                            currentStep === 'intent-detection' ? 'Step 2 of 5: Intent Check' :
                            currentStep === 'goal-impact' ? 'Step 3 of 5: Goal Impact' :
                            currentStep === 'decision-ladder' ? 'Step 4 of 5: Smart Ladder' :
                            'Step 5 of 5: Safety Net'
                          }
                        </span>
                      </div>

                      {/* Desktop View Switcher */}
                      <div className="hidden lg:flex items-center bg-[#F0F5FA] p-1 rounded-[10px] border border-[#DCE5EE] text-[12px]">
                        <button
                          onClick={() => setViewMode('split')}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[8px] font-semibold transition-all cursor-pointer ${
                            viewMode === 'split'
                              ? 'bg-white text-fintech-teal shadow-subtle'
                              : 'text-fintech-slate hover:text-fintech-navy'
                          }`}
                        >
                          <Columns className="w-3.5 h-3.5" />
                          <span>Desktop Split View</span>
                        </button>
                        <button
                          onClick={() => setViewMode('modal')}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[8px] font-semibold transition-all cursor-pointer ${
                            viewMode === 'modal'
                              ? 'bg-white text-fintech-teal shadow-subtle'
                              : 'text-fintech-slate hover:text-fintech-navy'
                          }`}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Focused Card View</span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop 2-Column Split View vs Authentic Modal Overlay View */}
                    {viewMode === 'split' ? (
                      currentStep !== 'confirmation' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(350px,0.85fr)] gap-7 items-start">
                          {/* Left Hero: The Interactive Step Component */}
                          <div className="min-w-0">
                            {renderStepContent()}
                          </div>

                          {/* Right Hero: Live Future You Simulator & Goal Context */}
                          <div className="min-w-[340px] sticky top-24">
                            <FutureYouSimulator
                              goal={primaryGoal}
                              selectedOption={selectedOption}
                              selectedIntent={selectedIntent}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-2xl mx-auto py-2">
                          {renderStepContent()}
                        </div>
                      )
                    ) : (
                      /* Authentic Modal Overlay View */
                      <div className="relative">
                        {/* Dimmed Background SIP Detail */}
                        <div className="opacity-40 pointer-events-none filter blur-[1px]">
                          <SIPDetailCard
                            sip={currentSip}
                            goal={primaryGoal}
                            onPauseClick={() => {}}
                            onModifyClick={() => {}}
                            isPaused={isSIPPaused}
                            pauseDetails={pauseDetails}
                          />
                        </div>

                        {/* Centered Modal Backdrop & Dialog */}
                        <div 
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              setCurrentStep('sip-detail');
                            }
                          }}
                          className="fixed inset-0 z-40 bg-fintech-navy/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-3 sm:p-6 overflow-y-auto transition-all"
                        >
                          <div className="w-full max-w-[620px] my-auto relative animate-fade-in shadow-dialog">
                            {renderStepContent()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TAB 3: OVERVIEW */}
            {currentTab === 'overview' && (
              <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-8 shadow-card text-left space-y-6 animate-fade-in">
                <div>
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-fintech-teal block mb-1">
                    Portfolio Overview
                  </span>
                  <h2 className="text-[26px] font-bold text-fintech-navy tracking-tight">
                    Welcome back, {mockInvestor.name}
                  </h2>
                  <p className="text-[13px] text-fintech-slate mt-1 max-w-xl">
                    Account: {mockInvestor.accountNo} • KYC Verified • Risk Profile: {mockInvestor.riskProfile}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
                    <span className="text-[11.5px] text-fintech-slate block uppercase font-bold">Total Portfolio Value</span>
                    <span className="text-[24px] font-extrabold text-fintech-navy block mt-1">₹{primaryGoal.currentSavings.toLocaleString('en-IN')}</span>
                    <span className="text-[12px] font-bold text-emerald-700 mt-1 inline-block">+14.8% Overall XIRR</span>
                  </div>

                  <div className="p-5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
                    <span className="text-[11.5px] text-fintech-slate block uppercase font-bold">Active SIP Commitment</span>
                    <span className="text-[24px] font-extrabold text-fintech-navy block mt-1">₹{currentSip.amount.toLocaleString('en-IN')} / mo</span>
                    <span className="text-[12px] font-bold text-fintech-teal mt-1 inline-block truncate max-w-full">{currentSip.fundName}</span>
                  </div>

                  <div className="p-5 bg-[#F8FAFC] rounded-[16px] border border-[#DCE5EE]">
                    <span className="text-[11.5px] text-fintech-slate block uppercase font-bold">Primary Goal</span>
                    <span className="text-[24px] font-extrabold text-fintech-navy block mt-1">
                      {primaryGoal.targetAmount >= 100000 ? `₹${(primaryGoal.targetAmount / 100000).toFixed(1)} Lakh` : `₹${primaryGoal.targetAmount.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[12px] font-bold text-emerald-700 mt-1 inline-block truncate max-w-full">
                      {primaryGoal.name} • {primaryGoal.status} ({primaryGoal.targetDate})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#EDF2F7]">
                  <button
                    onClick={() => setCurrentTab('investments')}
                    className="px-5 py-2.5 rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[13px] flex items-center space-x-2 cursor-pointer shadow-subtle transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Explore Market Investments</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('sips')}
                    className="px-5 py-2.5 rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] text-fintech-navy font-semibold text-[13px] flex items-center space-x-2 cursor-pointer border border-[#DCE5EE] transition-all"
                  >
                    <Repeat className="w-4 h-4 text-fintech-teal" />
                    <span>Manage SIP & Pause Saver™</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('goals')}
                    className="px-5 py-2.5 rounded-[12px] bg-[#F0F5FA] hover:bg-[#E3ECF4] text-fintech-navy font-semibold text-[13px] flex items-center space-x-2 cursor-pointer border border-[#DCE5EE] transition-all"
                  >
                    <Target className="w-4 h-4 text-fintech-teal" />
                    <span>Manage Goals ({goals.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: GOALS */}
            {currentTab === 'goals' && (
              <GoalsDashboard
                goals={goals}
                primaryGoal={primaryGoal}
                onMakePrimary={handleMakePrimary}
                onSaveGoal={handleSaveGoal}
                onDeleteGoal={handleDeleteGoal}
                onNavigateToSIPs={() => {
                  setCurrentTab('sips');
                  setCurrentStep('sip-detail');
                }}
              />
            )}

            {/* TAB 5: PORTFOLIO */}
            {currentTab === 'portfolio' && (
              <PortfolioDashboard
                primaryGoal={primaryGoal}
                onNavigateToSIPs={() => {
                  setCurrentTab('sips');
                  setCurrentStep('sip-detail');
                }}
                onNavigateToGoals={() => {
                  setCurrentTab('goals');
                }}
              />
            )}

            {/* TAB 6: INSIGHTS & AI */}
            {currentTab === 'insights' && (
              <div className="bg-white rounded-[22px] border border-[#DCE5EE] p-8 shadow-card text-left space-y-6 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-fintech-tealLight flex items-center justify-center text-fintech-teal">
                    <Sparkles className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-bold text-fintech-navy tracking-tight">Proactive AI Insights</h2>
                    <p className="text-[12.5px] text-fintech-slate">Behavioral decision support & market intelligence</p>
                  </div>
                </div>

                <div className="p-5 bg-[#EEF8F8] border border-[#CDEAEB] rounded-[16px] space-y-2">
                  <h4 className="font-bold text-[15px] text-fintech-navy">
                    Pause Saver™ Moment-of-Decision Guard
                  </h4>
                  <p className="text-[12.5px] text-fintech-navyMuted leading-relaxed">
                    Most retail investors pause or redeem mutual funds precisely when markets correct by 5–10%, locking in temporary paper losses and delaying their targets by months. Pause Saver™ intervenes at the exact moment you click "Pause SIP" to provide transparent, mathematical impact analysis before a decision is finalized.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => handleLoadIntent('market_fear', 'intent-detection')}
                      className="px-4 py-2 rounded-[10px] bg-fintech-teal text-white font-semibold text-[12.5px] shadow-subtle cursor-pointer hover:bg-fintech-tealHover"
                    >
                      Try Interactive Pause Saver Flow
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Safety Net Toast Alert */}
      {showToast && (
        <ToastNotification
          message={`Your SIP restarts in 7 days (${pauseDetails.untilDate}). You can modify or extend your pause with zero friction.`}
          subtext="Auto-resume protection active • WhatsApp & SMS alert confirmed"
          onDismiss={() => setShowToast(false)}
          onAction={() => {
            setCurrentTab('sips');
            setCurrentStep('decision-ladder');
            setShowToast(false);
          }}
          actionText="Modify or Extend Pause"
        />
      )}
    </div>
  );
}

export default App;
