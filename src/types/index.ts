export type StepId = 
  | 'sip-detail'          // Step 1
  | 'intent-detection'    // Step 2
  | 'goal-impact'         // Step 3
  | 'decision-ladder'     // Step 4
  | 'confirmation';       // Step 5

export type IntentId = 
  | 'cash_need'           // "I need the money"
  | 'market_fear'         // "Worried about the market"
  | 'performance_doubt'   // "Not sure it's working"
  | 'goal_change'         // "Goal changed or switching"
  | 'just_checking';      // "Just checking"

// Backward compatibility alias
export type IntentReasonId = IntentId | 'cash-need' | 'market-worry' | 'not-working' | 'goal-changed' | 'just-checking';

export interface IntentReason {
  id: IntentId;
  label: string;
  iconName: string;
  badge?: string;
  description: string;
}

export type DecisionOptionId = 
  | 'continue'
  | 'skip-1'
  | 'reduce-amount'
  | 'reduce-3000'
  | 'step-down'
  | 'pause-3'
  | 'pause-6'
  | 'review-plan'
  | 'modify-sip'
  | 'update-goal'
  | 'change-date';

export interface DecisionOption {
  id: DecisionOptionId;
  title: string;
  subtitle: string;
  tag?: string;
  iconName: string;
  disruptionLevel: 'none' | 'low' | 'medium' | 'high' | 'full';
  newGoalDate: string;
  delayMonths: number;
  contributionGap: number;
  compoundingLoss: number;
  badgeColor?: string;
  autoResumeDate?: string;
  details: string;
  badgeText?: string;
  primaryCtaLabel?: string;
}

export interface InvestorProfile {
  name: string;
  accountNo: string;
  kycStatus: 'Verified' | 'Pending';
  riskProfile: string;
}

export interface SIPDetails {
  id: string;
  fundName: string;
  fundCategory: string;
  planType: string;
  amount: number;
  frequency: string;
  nextDebitDate: string;
  status: 'Active' | 'Paused' | 'Modified' | 'Step-Down';
  history: Array<{
    amount: number;
    date: string;
    status: 'Completed' | 'Pending';
  }>;
  folioNumber: string;
  totalInvested: number;
  currentValue: number;
  xirr: number;
}

export type GoalStatus = 'On track' | 'Needs attention' | 'Behind plan' | 'Completed' | 'Delayed';
export type GoalCategory = 'Vehicle' | 'Education' | 'Home' | 'Travel' | 'Emergency' | 'Retirement' | 'Custom';
export type GoalPriority = 'High' | 'Medium' | 'Low';
export type GoalRiskPreference = 'Conservative' | 'Balanced' | 'Growth';

export interface GoalDetails {
  id: string;
  name: string;
  iconName: string;
  targetAmount: number;
  targetDate: string;
  originalGoalDate: string;
  currentSavings: number;
  monthlyContribution: number;
  status: GoalStatus;
  statusExplanation?: string;
  category: GoalCategory | string;
  priority: GoalPriority;
  isPrimary: boolean;
  linkedSIPName?: string;
  linkedSIPAmount?: number;
  riskPreference?: GoalRiskPreference;
  assumedAnnualReturn: number;
  monthsRemaining: number;
  isCompleted?: boolean;
  completedDate?: string;
}

export interface IntentConfiguration {
  id: IntentId;
  label: string;
  badgeLabel: string;
  headline: string;
  supportingCopy: string;
  aiInsightMessage: string;
  simulatorFocus: 'cash_flow' | 'market_timeline' | 'plan_health' | 'goal_target' | 'light_snapshot';
  decisionOptionsOrder: DecisionOptionId[];
  defaultSelectedOptionId: DecisionOptionId;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  allowDirectPause: boolean;
  directPauseLabel: string;
  explainabilityNote: string;
  assumptions: string[];
}
