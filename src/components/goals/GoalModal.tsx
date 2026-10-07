import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldAlert
} from 'lucide-react';
import type { GoalDetails, GoalCategory, GoalPriority, GoalRiskPreference } from '../../types';
import { AVAILABLE_GOAL_ICONS, renderGoalIcon } from './goalIcons';
import { calculateGoalStatus } from '../../services/goalsService';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: GoalDetails) => void;
  goalToEdit?: GoalDetails | null;
}

const CATEGORIES: GoalCategory[] = [
  'Vehicle',
  'Emergency',
  'Education',
  'Home',
  'Travel',
  'Retirement',
  'Custom',
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR + i);

interface GoalFormContentProps {
  goalToEdit?: GoalDetails | null;
  onClose: () => void;
  onSave: (goal: GoalDetails) => void;
}

const GoalFormContent: React.FC<GoalFormContentProps> = ({
  goalToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(goalToEdit);

  // Parse target date e.g. "Mar 2029"
  const parts = goalToEdit?.targetDate ? goalToEdit.targetDate.split(' ') : ['Mar', '2029'];
  const initialMonth = parts.length === 2 && MONTHS.includes(parts[0]) ? parts[0] : 'Mar';
  const initialYear = parts.length === 2 ? parseInt(parts[1], 10) || (CURRENT_YEAR + 3) : (CURRENT_YEAR + 3);

  // Form State initialized directly without useEffect
  const [name, setName] = useState(goalToEdit?.name || '');
  const [category, setCategory] = useState<GoalCategory>((goalToEdit?.category as GoalCategory) || 'Vehicle');
  const [iconName, setIconName] = useState(goalToEdit?.iconName || 'Bike');
  const [targetAmount, setTargetAmount] = useState<number>(goalToEdit?.targetAmount || 500000);
  const [targetMonth, setTargetMonth] = useState(initialMonth);
  const [targetYear, setTargetYear] = useState(initialYear);
  const [currentSavings, setCurrentSavings] = useState<number>(goalToEdit?.currentSavings || 25000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(goalToEdit?.monthlyContribution || 4000);
  const [priority, setPriority] = useState<GoalPriority>(goalToEdit?.priority || 'High');
  const [riskPreference, setRiskPreference] = useState<GoalRiskPreference>(goalToEdit?.riskPreference || 'Growth');
  const [isPrimary, setIsPrimary] = useState(goalToEdit?.isPrimary || false);
  const [linkedSIPName, setLinkedSIPName] = useState(goalToEdit?.linkedSIPName || 'Flexi Cap Fund (Direct)');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Format currency helper
  const formatIndianPreview = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const calculateMonthsRemaining = (targetM: string, targetY: number) => {
    const monthIndex = MONTHS.indexOf(targetM);
    const diffMonths = (targetY - CURRENT_YEAR) * 12 + (monthIndex - 2); // Approximate from Mar 2026
    return Math.max(1, diffMonths);
  };

  const assumedReturn = 
    riskPreference === 'Conservative' ? 6.5 :
    riskPreference === 'Balanced' ? 10.0 : 12.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter a goal name.');
      return;
    }
    if (targetAmount <= 0) {
      setValidationError('Target amount must be greater than zero.');
      return;
    }

    const monthsRemaining = calculateMonthsRemaining(targetMonth, targetYear);
    const targetDateStr = `${targetMonth} ${targetYear}`;
    
    // Derive status & explanation
    const { status, explanation } = calculateGoalStatus(
      currentSavings,
      monthlyContribution,
      targetAmount,
      monthsRemaining,
      assumedReturn
    );

    const goalPayload: GoalDetails = {
      id: goalToEdit ? goalToEdit.id : `goal-${Math.floor(Math.random() * 900000 + 100000)}`,
      name: name.trim(),
      category,
      iconName,
      targetAmount,
      targetDate: targetDateStr,
      originalGoalDate: goalToEdit?.originalGoalDate || targetDateStr,
      currentSavings,
      monthlyContribution,
      priority,
      isPrimary,
      linkedSIPName,
      linkedSIPAmount: monthlyContribution,
      riskPreference,
      assumedAnnualReturn: assumedReturn,
      monthsRemaining,
      status,
      statusExplanation: explanation,
      isCompleted: currentSavings >= targetAmount,
      completedDate: currentSavings >= targetAmount ? (goalToEdit?.completedDate || targetDateStr) : undefined,
    };

    onSave(goalPayload);
    onClose();
  };

  return (
    <div className="bg-white rounded-[22px] border border-[#DCE5EE] shadow-2xl max-w-2xl w-full my-auto overflow-hidden text-left animate-slide-up">
      {/* Modal Header */}
      <div className="p-6 border-b border-[#EDF2F7] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[12px] bg-fintech-tealLight border border-fintech-teal/20 text-fintech-teal flex items-center justify-center">
            {renderGoalIcon(iconName, { className: 'w-5 h-5 stroke-[2.2]' })}
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-fintech-navy">
              {isEditing ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <p className="text-[12.5px] text-fintech-slate">
              {isEditing ? 'Update targets and SIP synchronization' : 'Set a clear milestone for your compounding'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-[8px] hover:bg-[#F0F5FA] flex items-center justify-center text-fintech-slate hover:text-fintech-navy transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-[12px] text-rose-700 text-[12.5px] font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Goal Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Goal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dream Bike, New Home, MBA"
              className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as GoalCategory;
                setCategory(cat);
                if (cat === 'Vehicle') setIconName('Bike');
                else if (cat === 'Emergency') setIconName('Shield');
                else if (cat === 'Education') setIconName('GraduationCap');
                else if (cat === 'Home') setIconName('Home');
                else if (cat === 'Travel') setIconName('Plane');
                else if (cat === 'Retirement') setIconName('Landmark');
              }}
              className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-2">
            Select Goal Icon
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_GOAL_ICONS.map((item) => {
              const IconComponent = item.icon;
              const isSelected = iconName === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIconName(item.name)}
                  className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-fintech-teal text-white border-fintech-teal shadow-subtle'
                      : 'bg-[#F8FAFC] text-fintech-slate border-[#DCE5EE] hover:bg-[#F0F5FA] hover:text-fintech-navy'
                  }`}
                  title={item.label}
                >
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[10px] font-semibold truncate w-full text-center">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Amount & Live Indian Notation */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[12px] font-bold text-fintech-navy uppercase tracking-wider">
              Target Amount (₹) *
            </label>
            <span className="text-[12.5px] font-bold text-fintech-teal">
              Preview: {formatIndianPreview(targetAmount)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-fintech-slate font-bold text-[14px]">₹</span>
            <input
              type="number"
              min="5000"
              step="5000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-bold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal"
              required
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[200000, 500000, 800000, 1200000, 2500000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetAmount(preset)}
                className="px-2.5 py-1 rounded-[8px] bg-[#F0F5FA] hover:bg-[#E3ECF4] border border-[#DCE5EE] text-[11px] font-semibold text-fintech-navy transition-colors cursor-pointer"
              >
                {formatIndianPreview(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Target Date & Remaining Months */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Target Month & Year
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="px-3 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[13.5px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
                className="px-3 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[13.5px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Horizon Calculation
            </label>
            <div className="px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[13.5px] text-fintech-navy flex items-center justify-between">
              <span className="text-fintech-slate text-[12px]">Months Remaining:</span>
              <span className="font-bold text-fintech-teal">
                {calculateMonthsRemaining(targetMonth, targetYear)} months
              </span>
            </div>
          </div>
        </div>

        {/* Current Accumulated Savings & Monthly SIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Current Accumulated Savings (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-fintech-slate font-bold text-[14px]">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-bold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Monthly Planned SIP (₹ / mo)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-fintech-slate font-bold text-[14px]">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-bold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal"
              />
            </div>
          </div>
        </div>

        {/* Strategy / Risk Preference & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Compounding Strategy
            </label>
            <select
              value={riskPreference}
              onChange={(e) => setRiskPreference(e.target.value as GoalRiskPreference)}
              className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal cursor-pointer"
            >
              <option value="Conservative">Conservative (Debt/Arbitrage ~6.5%)</option>
              <option value="Balanced">Balanced (Hybrid/Index ~10.0%)</option>
              <option value="Growth">Growth (Active Equity ~12.0%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
              Goal Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as GoalPriority)}
              className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal cursor-pointer"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Linked SIP Name */}
        <div>
          <label className="block text-[12px] font-bold text-fintech-navy uppercase tracking-wider mb-1.5">
            Linked Investment / SIP Name
          </label>
          <input
            type="text"
            value={linkedSIPName}
            onChange={(e) => setLinkedSIPName(e.target.value)}
            placeholder="e.g. Flexi Cap Fund (Direct)"
            className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#DCE5EE] bg-[#F8FAFC] text-[14px] text-fintech-navy font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-teal/20 focus:border-fintech-teal"
          />
        </div>

        {/* Primary Goal Switch */}
        <div className="p-4 bg-[#EEF8F8] border border-[#CDEAEB] rounded-[14px] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[13.5px] font-bold text-fintech-navy block">
              Set as Primary Goal
            </span>
            <p className="text-[11.5px] text-fintech-navyMuted">
              Displays in the sidebar badge and links directly to Pause Saver™ intervention.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fintech-teal"></div>
          </label>
        </div>
      </form>

      {/* Modal Actions Footer */}
      <div className="p-6 border-t border-[#EDF2F7] bg-[#FAFCFE] flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#F0F5FA] border border-[#DCE5EE] text-fintech-navy font-semibold text-[13px] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-[12px] bg-fintech-teal hover:bg-fintech-tealHover text-white font-semibold text-[13px] shadow-subtle hover:shadow transition-all cursor-pointer flex items-center space-x-2"
        >
          <Check className="w-4 h-4 stroke-[2.4]" />
          <span>{isEditing ? 'Save Changes' : 'Create Goal'}</span>
        </button>
      </div>
    </div>
  );
};

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-fintech-navy/60 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <GoalFormContent
        key={goalToEdit?.id || 'new'}
        goalToEdit={goalToEdit}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
};
