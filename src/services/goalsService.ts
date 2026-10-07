import { GoalDetails, GoalStatus, SIPDetails, DecisionOption, DecisionOptionId } from '../types';

const GOALS_STORAGE_KEY = 'finlit_user_goals';
const PRIMARY_GOAL_ID_KEY = 'finlit_primary_goal_id';

export const INITIAL_GOALS: GoalDetails[] = [
  {
    id: 'goal-bike',
    name: 'Dream Bike',
    iconName: 'Bike',
    category: 'Vehicle',
    targetAmount: 800000, // ₹8 Lakh
    targetDate: 'Mar 2029',
    originalGoalDate: 'Mar 2029',
    currentSavings: 118420,
    monthlyContribution: 4000,
    status: 'On track',
    statusExplanation: 'Your monthly ₹4,000 contribution is aligned with your Mar 2029 target.',
    priority: 'High',
    isPrimary: true,
    linkedSIPName: 'Flexi Cap Fund (Direct)',
    linkedSIPAmount: 4000,
    riskPreference: 'Growth',
    assumedAnnualReturn: 12.0,
    monthsRemaining: 30,
  },
  {
    id: 'goal-emergency',
    name: 'Emergency Fund',
    iconName: 'Shield',
    category: 'Emergency',
    targetAmount: 200000, // ₹2 Lakh
    targetDate: 'Jun 2027',
    originalGoalDate: 'Jun 2027',
    currentSavings: 145000,
    monthlyContribution: 5000,
    status: 'On track',
    statusExplanation: 'Healthy buffer accumulating on schedule. 72.5% funded.',
    priority: 'High',
    isPrimary: false,
    linkedSIPName: 'Liquid Reserves Allocation',
    linkedSIPAmount: 5000,
    riskPreference: 'Conservative',
    assumedAnnualReturn: 6.5,
    monthsRemaining: 9,
  },
  {
    id: 'goal-education',
    name: 'Higher Education',
    iconName: 'GraduationCap',
    category: 'Education',
    targetAmount: 1200000, // ₹12 Lakh
    targetDate: 'Aug 2030',
    originalGoalDate: 'Aug 2030',
    currentSavings: 280000,
    monthlyContribution: 7000,
    status: 'Needs attention',
    statusExplanation: 'At current ₹7,000/mo, target may need 4 additional months or +₹1,200/mo bump.',
    priority: 'Medium',
    isPrimary: false,
    linkedSIPName: 'Global Opportunities Direct',
    linkedSIPAmount: 7000,
    riskPreference: 'Balanced',
    assumedAnnualReturn: 11.5,
    monthsRemaining: 46,
  },
  {
    id: 'goal-laptop',
    name: 'Gaming Laptop',
    iconName: 'Laptop',
    category: 'Custom',
    targetAmount: 120000, // ₹1.2 Lakh
    targetDate: 'Dec 2025',
    originalGoalDate: 'Dec 2025',
    currentSavings: 120000,
    monthlyContribution: 0,
    status: 'Completed',
    statusExplanation: 'Goal target achieved on schedule. Fully funded and purchased.',
    priority: 'Low',
    isPrimary: false,
    isCompleted: true,
    completedDate: 'Dec 2025',
    linkedSIPName: 'Completed Target',
    riskPreference: 'Conservative',
    assumedAnnualReturn: 8.0,
    monthsRemaining: 0,
  },
];

export function calculateGoalStatus(
  currentSavings: number,
  monthlyContribution: number,
  targetAmount: number,
  monthsRemaining: number,
  assumedReturn = 12.0
): { status: GoalStatus; explanation: string } {
  if (currentSavings >= targetAmount) {
    return {
      status: 'Completed',
      explanation: 'Target amount has been fully reached and achieved.',
    };
  }

  if (monthsRemaining <= 0) {
    return {
      status: 'Needs attention',
      explanation: 'Target date has passed. Consider extending target date.',
    };
  }

  // Future value estimation with compounding
  const r = assumedReturn / 100 / 12;
  const futureSavingsFromLump = currentSavings * Math.pow(1 + r, monthsRemaining);
  const futureSavingsFromSIP = monthlyContribution * ((Math.pow(1 + r, monthsRemaining) - 1) / r);
  const projectedTotal = futureSavingsFromLump + futureSavingsFromSIP;

  const coverage = projectedTotal / targetAmount;

  if (coverage >= 0.96) {
    return {
      status: 'On track',
      explanation: 'Your current contribution pattern is aligned with your target date.',
    };
  }
  if (coverage >= 0.8) {
    return {
      status: 'Needs attention',
      explanation: 'At current contribution level, your target may need a later date or higher monthly contribution.',
    };
  }
  return {
    status: 'Behind plan',
    explanation: 'Projected corpus is trailing target amount. Increasing monthly contribution recommended.',
  };
}

export function getGoals(): GoalDetails[] {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(INITIAL_GOALS));
      localStorage.setItem(PRIMARY_GOAL_ID_KEY, 'goal-bike');
      return INITIAL_GOALS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_GOALS;
    }
    return parsed;
  } catch {
    return INITIAL_GOALS;
  }
}

export function saveGoalsList(goals: GoalDetails[]): void {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save goals:', err);
  }
}

export function getPrimaryGoal(): GoalDetails {
  const goals = getGoals();
  const primaryId = localStorage.getItem(PRIMARY_GOAL_ID_KEY) || 'goal-bike';
  const match = goals.find((g) => g.id === primaryId) || goals.find((g) => g.isPrimary) || goals[0];
  return match;
}

export function setPrimaryGoal(goalId: string): GoalDetails {
  const goals = getGoals();
  const updated = goals.map((g) => ({
    ...g,
    isPrimary: g.id === goalId,
  }));
  saveGoalsList(updated);
  localStorage.setItem(PRIMARY_GOAL_ID_KEY, goalId);
  const selected = updated.find((g) => g.id === goalId) || updated[0];
  return selected;
}

export function saveGoal(goalToSave: GoalDetails): GoalDetails[] {
  const goals = getGoals();
  const exists = goals.some((g) => g.id === goalToSave.id);

  let updated: GoalDetails[];
  if (exists) {
    updated = goals.map((g) => {
      if (g.id === goalToSave.id) {
        return goalToSave;
      }
      if (goalToSave.isPrimary) {
        return { ...g, isPrimary: false };
      }
      return g;
    });
  } else {
    updated = [goalToSave, ...goals];
    if (goalToSave.isPrimary) {
      updated = updated.map((g) => (g.id === goalToSave.id ? g : { ...g, isPrimary: false }));
    }
  }

  saveGoalsList(updated);
  if (goalToSave.isPrimary) {
    localStorage.setItem(PRIMARY_GOAL_ID_KEY, goalToSave.id);
  }
  return updated;
}

export function createGoal(newGoalData: Omit<GoalDetails, 'id'>): GoalDetails {
  const newId = `goal-${Date.now().toString().slice(-6)}`;
  const goal: GoalDetails = {
    ...newGoalData,
    id: newId,
  };
  saveGoal(goal);
  return goal;
}

export function deleteGoal(goalId: string): GoalDetails[] {
  const goals = getGoals();
  const updated = goals.filter((g) => g.id !== goalId);
  saveGoalsList(updated);

  // If deleted was primary, assign first remaining as primary
  const primaryId = localStorage.getItem(PRIMARY_GOAL_ID_KEY);
  if (primaryId === goalId && updated.length > 0) {
    updated[0].isPrimary = true;
    saveGoalsList(updated);
    localStorage.setItem(PRIMARY_GOAL_ID_KEY, updated[0].id);
  }
  return updated;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shiftDate(dateStr: string, monthsToAdd: number): string {
  if (!dateStr || monthsToAdd === 0) return dateStr || 'Mar 2029';
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length < 2) return dateStr;
  
  const mStr = parts[0];
  const yStr = parts[1];
  const mIdx = MONTH_NAMES.indexOf(mStr);
  const startIdx = mIdx !== -1 ? mIdx : 2; // Default to Mar if not found
  const startYear = parseInt(yStr, 10) || 2029;

  const totalMonths = startIdx + monthsToAdd;
  const yearShift = Math.floor(totalMonths / 12);
  const targetMonthIdx = ((totalMonths % 12) + 12) % 12;
  const targetYear = startYear + yearShift;

  return `${MONTH_NAMES[targetMonthIdx]} ${targetYear}`;
}

export function getLinkedSip(goal: GoalDetails): SIPDetails {
  const isEducation = goal.id === 'goal-education' || goal.category === 'Education';
  const isEmergency = goal.id === 'goal-emergency' || goal.category === 'Emergency';
  
  const fundCategory = isEmergency 
    ? 'Debt • Liquid Reserves • Direct Growth'
    : isEducation
    ? 'Equity • Global Opportunities • Direct Growth'
    : 'Equity • Multi Cap • Direct Growth';

  const planType = 'Direct - Growth';
  const folioNumber = isEmergency 
    ? '7731/109482' 
    : isEducation 
    ? '8821/992014' 
    : '9182/448291';

  const monthlyAmount = goal.linkedSIPAmount || goal.monthlyContribution || 4000;
  const currentVal = goal.currentSavings || 118420;
  const totalInv = Math.round(currentVal * 0.81);

  return {
    id: `sip-${goal.id}`,
    fundName: goal.linkedSIPName || (isEmergency ? 'Liquid Reserves Allocation' : isEducation ? 'Global Opportunities Direct' : 'Flexi Cap Fund (Direct)'),
    fundCategory,
    planType,
    amount: monthlyAmount,
    frequency: 'Monthly',
    nextDebitDate: '5 Nov 2026',
    status: 'Active',
    folioNumber,
    totalInvested: totalInv,
    currentValue: currentVal,
    xirr: 14.8,
    history: [
      { amount: monthlyAmount, date: '5 Oct', status: 'Completed' },
      { amount: monthlyAmount, date: '5 Sep', status: 'Completed' },
      { amount: monthlyAmount, date: '5 Aug', status: 'Completed' },
    ],
  };
}

export function getDynamicDecisionOptions(goal: GoalDetails): Record<DecisionOptionId, DecisionOption> {
  const monthlySIP = goal.linkedSIPAmount || goal.monthlyContribution || 4000;
  const targetLakh = goal.targetAmount >= 100000 
    ? `₹${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)} Lakh` 
    : `₹${goal.targetAmount.toLocaleString('en-IN')}`;

  const halfSip = Math.round(monthlySIP * 0.5);
  const reducedSip = Math.round(monthlySIP * 0.75);
  const reducedCashFreed = monthlySIP - reducedSip;

  return {
    'continue': {
      id: 'continue',
      title: 'Continue',
      subtitle: 'Goal on track',
      tag: 'Recommended',
      iconName: 'Target',
      disruptionLevel: 'none',
      newGoalDate: goal.targetDate,
      delayMonths: 0,
      contributionGap: 0,
      compoundingLoss: 0,
      details: `Zero delay. Your ${targetLakh} ${goal.name.toLowerCase()} goal stays projected for ${goal.targetDate}.`,
      badgeText: 'On track',
      primaryCtaLabel: 'Keep SIP Active (Continue)',
    },
    'skip-1': {
      id: 'skip-1',
      title: 'Skip next installment',
      subtitle: '(1 month)',
      tag: '1 month break',
      iconName: 'Calendar',
      disruptionLevel: 'low',
      newGoalDate: shiftDate(goal.targetDate, 1),
      delayMonths: 1,
      contributionGap: monthlySIP,
      compoundingLoss: Math.round(monthlySIP * 0.32),
      autoResumeDate: '5 Dec 2026',
      details: 'Pauses only the 5 Nov debit. Auto-resumes normally on 5 Dec.',
      badgeText: '+1 mo delay',
      primaryCtaLabel: 'Skip Next 1 Month',
    },
    'reduce-amount': {
      id: 'reduce-amount',
      title: `Reduce to ₹${halfSip.toLocaleString('en-IN')}`,
      subtitle: '(50% reduction for cash relief)',
      tag: `Frees ₹${halfSip.toLocaleString('en-IN')}/mo cash`,
      iconName: 'ArrowDown',
      disruptionLevel: 'low',
      newGoalDate: shiftDate(goal.targetDate, 2),
      delayMonths: 2,
      contributionGap: halfSip * 3,
      compoundingLoss: Math.round(halfSip * 3 * 0.32),
      autoResumeDate: '5 Feb 2027',
      details: `Immediate ₹${halfSip.toLocaleString('en-IN')}/mo cash relief while keeping compounding habit alive.`,
      badgeText: `Frees ₹${(halfSip / 1000).toFixed(halfSip % 1000 === 0 ? 0 : 1)}k/mo`,
      primaryCtaLabel: `Continue with ₹${halfSip.toLocaleString('en-IN')} SIP`,
    },
    'reduce-3000': {
      id: 'reduce-3000',
      title: `Reduce to ₹${reducedSip.toLocaleString('en-IN')}`,
      subtitle: '(25% reduction)',
      tag: 'Low cashflow impact',
      iconName: 'ArrowDown',
      disruptionLevel: 'low',
      newGoalDate: shiftDate(goal.targetDate, 2),
      delayMonths: 2,
      contributionGap: reducedCashFreed * 3,
      compoundingLoss: Math.round(reducedCashFreed * 3 * 0.31),
      autoResumeDate: '5 May 2027',
      details: `Keeps compounding discipline active while freeing ₹${reducedCashFreed.toLocaleString('en-IN')}/month cash.`,
      badgeText: '+2 mo delay',
      primaryCtaLabel: `Reduce to ₹${reducedSip.toLocaleString('en-IN')}/mo`,
    },
    'step-down': {
      id: 'step-down',
      title: 'Step-down 3 months',
      subtitle: `₹${halfSip.toLocaleString('en-IN')}/month for 3 months, then auto-restore`,
      tag: 'Smart balance',
      iconName: 'RefreshCw',
      disruptionLevel: 'medium',
      newGoalDate: shiftDate(goal.targetDate, 2),
      delayMonths: 2,
      contributionGap: halfSip * 3,
      compoundingLoss: Math.round(halfSip * 3 * 0.32),
      autoResumeDate: '5 Feb 2027',
      details: `Temporary 50% relief for 90 days. Automatically restores to ₹${monthlySIP.toLocaleString('en-IN')} on 5 Feb.`,
      badgeText: 'Auto-restores 5 Feb',
      primaryCtaLabel: 'Enable 3-Month Step-Down',
    },
    'pause-3': {
      id: 'pause-3',
      title: 'Pause 1 to 3 months',
      subtitle: 'with auto-resume on 5 Feb',
      tag: 'Temporary relief',
      iconName: 'Calendar',
      disruptionLevel: 'medium',
      newGoalDate: shiftDate(goal.targetDate, 2),
      delayMonths: 2,
      contributionGap: monthlySIP * 3,
      compoundingLoss: Math.round(monthlySIP * 3 * 0.32),
      autoResumeDate: '5 Feb 2027',
      details: 'Short pause for cash relief. Automatically reactivates on 5 Feb.',
      badgeText: '+2 mo delay',
      primaryCtaLabel: 'Pause 3 Months with Auto-Resume',
    },
    'pause-6': {
      id: 'pause-6',
      title: 'Pause with auto-resume',
      subtitle: '(6 months)',
      tag: 'Full pause',
      iconName: 'PauseCircle',
      disruptionLevel: 'high',
      newGoalDate: shiftDate(goal.targetDate, 5),
      delayMonths: 5,
      contributionGap: monthlySIP * 6,
      compoundingLoss: Math.round(monthlySIP * 6 * 0.31),
      autoResumeDate: '5 May 2027',
      details: 'Full pause for 6 debits. Safety net automatically reactivates on 5 May.',
      badgeText: '+5 mo delay',
      primaryCtaLabel: 'Pause 6 Months with Auto-Resume',
    },
    'review-plan': {
      id: 'review-plan',
      title: 'Review portfolio health',
      subtitle: 'Audit returns, XIRR and asset allocation',
      tag: 'Recommended first',
      iconName: 'CheckCircle',
      disruptionLevel: 'none',
      newGoalDate: goal.targetDate,
      delayMonths: 0,
      contributionGap: 0,
      compoundingLoss: 0,
      details: `Verify your fund performance (14.8% XIRR) against benchmark before changing.`,
      badgeText: 'Health check',
      primaryCtaLabel: 'Review My Plan',
    },
    'modify-sip': {
      id: 'modify-sip',
      title: 'Modify SIP amount or fund',
      subtitle: 'Reallocate to a fund matching your revised expectation',
      tag: 'Strategic switch',
      iconName: 'Sliders',
      disruptionLevel: 'low',
      newGoalDate: goal.targetDate,
      delayMonths: 0,
      contributionGap: 0,
      compoundingLoss: 0,
      details: 'Switch to another fund in the portfolio or modify monthly debit date.',
      badgeText: 'Zero delay',
      primaryCtaLabel: 'Modify SIP Parameters',
    },
    'update-goal': {
      id: 'update-goal',
      title: 'Update goal parameters',
      subtitle: 'Adjust target amount or target date to match reality',
      tag: 'Recommended',
      iconName: 'Target',
      disruptionLevel: 'none',
      newGoalDate: 'Recalibrated',
      delayMonths: 0,
      contributionGap: 0,
      compoundingLoss: 0,
      details: 'Keep investing on course by syncing your plan with your actual current goal.',
      badgeText: 'Goal sync',
      primaryCtaLabel: 'Update My Goal',
    },
    'change-date': {
      id: 'change-date',
      title: 'Extend goal horizon',
      subtitle: 'Shift target date by 6–12 months to lower monthly burden',
      tag: 'Flexible horizon',
      iconName: 'Calendar',
      disruptionLevel: 'low',
      newGoalDate: shiftDate(goal.targetDate, 9),
      delayMonths: 9,
      contributionGap: 0,
      compoundingLoss: 0,
      details: 'Extending your target date lowers required monthly capital without pausing.',
      badgeText: '+9 mo horizon',
      primaryCtaLabel: 'Extend Goal Horizon',
    },
  };
}
