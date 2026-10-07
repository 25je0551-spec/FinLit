import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  Sparkles, 
  Trophy, 
  ChevronDown
} from 'lucide-react';
import type { GoalDetails } from '../../types';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';
import { GoalImpactSimulatorModal } from './GoalImpactSimulatorModal';

interface GoalsDashboardProps {
  goals: GoalDetails[];
  primaryGoal: GoalDetails;
  onMakePrimary: (goalId: string) => void;
  onSaveGoal: (goal: GoalDetails) => void;
  onDeleteGoal: (goalId: string) => void;
  onNavigateToSIPs?: () => void;
}

export const GoalsDashboard: React.FC<GoalsDashboardProps> = ({
  goals,
  primaryGoal,
  onMakePrimary,
  onSaveGoal,
  onDeleteGoal,
  onNavigateToSIPs,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalDetails | null>(null);
  const [simulatingGoal, setSimulatingGoal] = useState<GoalDetails | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter active vs completed goals
  const activeGoals = goals.filter((g) => !g.isCompleted && g.status !== 'Completed');
  const completedGoals = goals.filter((g) => g.isCompleted || g.status === 'Completed');

  // Summary Metrics calculations
  const totalTargetCorpus = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulatedSavings = activeGoals.reduce((sum, g) => sum + g.currentSavings, 0);
  const totalMonthlyCommitment = activeGoals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const overallFundedPercent = totalTargetCorpus > 0 
    ? ((totalAccumulatedSavings / totalTargetCorpus) * 100).toFixed(1) 
    : '0';

  const formatLakh = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: GoalDetails) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleOpenSimulate = (goal: GoalDetails) => {
    setSimulatingGoal(goal);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center space-x-2 text-fintech-teal mb-1">
            <Target className="w-4 h-4 text-fintech-teal" />
            <span className="text-[11.5px] font-bold uppercase tracking-wider">
              Goal-Based Compounding Engine
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-fintech-navy tracking-tight">
            Your Goals
          </h1>
          <p className="text-[13.5px] text-fintech-slate mt-1 max-w-2xl leading-relaxed">
            Track what you're investing for and keep your plan aligned with what matters to you.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[13.5px] shadow-subtle hover:shadow transition-all cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.4]" />
            <span>Add new goal</span>
          </button>
        </div>
      </div>

      {/* 2. Top Portfolio Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Target */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
            Total Target Corpus
          </span>
          <span className="text-[24px] font-extrabold text-fintech-navy block tracking-tight">
            {formatLakh(totalTargetCorpus)}
          </span>
          <span className="text-[12px] text-fintech-slate font-medium block">
            Across {activeGoals.length} active milestones
          </span>
        </div>

        {/* Card 2: Accumulated */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
            Accumulated Savings
          </span>
          <span className="text-[24px] font-extrabold text-emerald-700 block tracking-tight">
            {formatLakh(totalAccumulatedSavings)}
          </span>
          <span className="text-[12px] text-emerald-800 font-semibold block">
            {overallFundedPercent}% overall funded
          </span>
        </div>

        {/* Card 3: Monthly SIP Commitment */}
        <div className="bg-white rounded-[18px] border border-[#DCE5EE] p-5 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-fintech-slate uppercase tracking-wider block">
            Monthly SIP Allocation
          </span>
          <span className="text-[24px] font-extrabold text-fintech-navy block tracking-tight">
            ₹{totalMonthlyCommitment.toLocaleString('en-IN')}<span className="text-[14px] font-normal text-fintech-slate"> / mo</span>
          </span>
          <span className="text-[12px] text-fintech-teal font-semibold block">
            Disciplined monthly flow
          </span>
        </div>

        {/* Card 4: Primary Goal Spotlight */}
        <div className="bg-[#EEF8F8] rounded-[18px] border border-[#CDEAEB] p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-fintech-teal uppercase tracking-wider block">
              Primary Goal Active
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fintech-teal text-white">
              Pause Saver Link
            </span>
          </div>
          <span className="text-[18px] font-extrabold text-fintech-navy block tracking-tight truncate">
            {primaryGoal?.name || 'Dream Bike'}
          </span>
          <span className="text-[12px] text-fintech-navyMuted font-medium block">
            {formatLakh(primaryGoal?.targetAmount || 800000)} • {primaryGoal?.targetDate || 'Mar 2029'}
          </span>
        </div>
      </div>

      {/* 3. Primary Goal Sync Notice */}
      <div className="bg-white rounded-[16px] border border-[#DCE5EE] p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-fintech-teal shrink-0 mt-0.5" />
          <div className="text-[13px] text-fintech-navy leading-relaxed">
            <span className="font-bold text-fintech-navy">
              Pause Saver™ is currently synchronized with "{primaryGoal?.name}".
            </span>
            <p className="text-fintech-slate text-[12px] mt-0.5">
              Whenever you consider pausing or modifying an investment, Pause Saver simulates impacts against your primary goal. Click "Make primary" on any card to switch this focus.
            </p>
          </div>
        </div>

        {onNavigateToSIPs && (
          <button
            type="button"
            onClick={onNavigateToSIPs}
            className="px-4 py-2 rounded-[10px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-fintech-navy font-semibold text-[12px] transition-colors cursor-pointer shrink-0"
          >
            Review SIP & Pause Saver
          </button>
        )}
      </div>

      {/* 4. Active Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-[20px] font-bold text-fintech-navy tracking-tight">
              Active Goals ({activeGoals.length})
            </h2>
            <span className="text-[12px] text-fintech-slate font-medium">
              Sorted by priority and status
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onMakePrimary={onMakePrimary}
              onEdit={handleOpenEdit}
              onDelete={onDeleteGoal}
              onSimulate={handleOpenSimulate}
            />
          ))}
        </div>
      </div>

      {/* 5. Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="pt-4 space-y-4">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 text-fintech-navy hover:text-fintech-teal transition-colors cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-[18px] font-bold tracking-tight">
              Completed Milestones ({completedGoals.length})
            </h2>
            <ChevronDown className={`w-4 h-4 text-fintech-slate transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
          </button>

          {showCompleted && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onMakePrimary={onMakePrimary}
                  onEdit={handleOpenEdit}
                  onDelete={onDeleteGoal}
                  onSimulate={handleOpenSimulate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create or Edit Goal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveGoal}
        goalToEdit={editingGoal}
      />

      {/* Modal: Goal Impact Simulator */}
      <GoalImpactSimulatorModal
        isOpen={Boolean(simulatingGoal)}
        goal={simulatingGoal}
        onClose={() => setSimulatingGoal(null)}
      />
    </div>
  );
};
