import { IntentConfiguration, IntentId, GoalDetails } from '../types';

export const intentConfigurations: Record<IntentId, IntentConfiguration> = {
  cash_need: {
    id: 'cash_need',
    label: 'I need the money',
    badgeLabel: 'Cash Flexibility Path',
    headline: "Need the money? That's okay.",
    supportingCopy: "Let's find the least disruptive way to free up cash while keeping your goal plan visible.",
    aiInsightMessage: "Your priority appears to be freeing up cash. Here's how different SIP changes could create flexibility while keeping your goal visible.",
    simulatorFocus: 'cash_flow',
    decisionOptionsOrder: ['reduce-amount', 'skip-1', 'pause-3', 'pause-6'],
    defaultSelectedOptionId: 'reduce-amount',
    primaryActionLabel: 'Confirm Cash Relief Option',
    secondaryActionLabel: 'Need a full pause instead?',
    allowDirectPause: true,
    directPauseLabel: 'Pause SIP directly',
    explainabilityNote: "You selected 'I need the money'. Pause Saver focuses on freeing monthly cash flow while keeping goal delay minimal.",
    assumptions: [
      'Current SIP: ₹4,000/month',
      'Target Goal: ₹8 Lakh by Mar 2029 (Dream Bike)',
      'Cash flow flexibility prioritized over rigid retention',
      'Zero guilt: genuine financial emergencies are respected',
    ],
  },
  market_fear: {
    id: 'market_fear',
    label: 'Worried about the market',
    badgeLabel: 'Market Context & Volatility',
    headline: "Markets feel uncertain. Let's look at what this means for your goal.",
    supportingCopy: "Recent market movement is one factor, but your SIP decision also affects the amount and timing of your contributions.",
    aiInsightMessage: "Your main concern appears to be market uncertainty. Before making a longer pause, here's what a temporary change could mean for your Mar 2029 goal.",
    simulatorFocus: 'market_timeline',
    decisionOptionsOrder: ['continue', 'skip-1', 'reduce-3000', 'step-down', 'pause-6'],
    defaultSelectedOptionId: 'continue',
    primaryActionLabel: 'Confirm Selection',
    secondaryActionLabel: 'Continue without this',
    allowDirectPause: true,
    directPauseLabel: 'Pause anyway',
    explainabilityNote: "You're seeing this because you selected market concern and your SIP currently contributes ₹4,000/month toward your Mar 2029 goal. These projections are estimates and do not predict market returns.",
    assumptions: [
      'Monthly contribution: ₹4,000',
      'Goal horizon: Mar 2029 (30 months remaining)',
      '12.0% p.a. long-term historical compounding assumption',
      'Projections are illustrative estimates for decision support',
    ],
  },
  performance_doubt: {
    id: 'performance_doubt',
    label: "Not sure it's working",
    badgeLabel: 'Plan Health & Verification',
    headline: "Let's check whether the plan is doing what you expect.",
    supportingCopy: "Before pausing or switching, let's verify if your contributions and compounding timeline are tracking your target milestone.",
    aiInsightMessage: "You're unsure whether the plan is working. Let's examine your goal progress before making a permanent change.",
    simulatorFocus: 'plan_health',
    decisionOptionsOrder: ['review-plan', 'modify-sip', 'reduce-amount', 'skip-1', 'pause-6'],
    defaultSelectedOptionId: 'review-plan',
    primaryActionLabel: 'Review My Plan',
    secondaryActionLabel: 'Pause anyway',
    allowDirectPause: true,
    directPauseLabel: 'Pause anyway without review',
    explainabilityNote: "You selected 'Not sure it's working'. Pause Saver audits current milestone consistency against your ₹8 Lakh target.",
    assumptions: [
      'Total contributed to date: ₹96,000 (24 months)',
      'Current portfolio value: ₹1,18,420 (14.8% XIRR)',
      '14.8% of ₹8L target reached on schedule',
      'Demo performance metrics provided for plan auditing',
    ],
  },
  goal_change: {
    id: 'goal_change',
    label: 'Goal changed or switching',
    badgeLabel: 'Goal Realignment',
    headline: 'Your goal may have changed.',
    supportingCopy: "Let's update the plan before deciding what to do with your SIP. Before pausing, let's make sure your investment plan matches your new goal.",
    aiInsightMessage: 'Your original goal may no longer reflect your current plans. Updating the goal may be more useful than simply pausing the SIP.',
    simulatorFocus: 'goal_target',
    decisionOptionsOrder: ['update-goal', 'modify-sip', 'change-date', 'skip-1', 'pause-6'],
    defaultSelectedOptionId: 'update-goal',
    primaryActionLabel: 'Update My Goal',
    secondaryActionLabel: 'Pause SIP instead',
    allowDirectPause: true,
    directPauseLabel: 'Pause SIP directly',
    explainabilityNote: "You selected 'Goal changed or switching'. Realigning targets keeps your portfolio purposeful without abandoning disciplined investing.",
    assumptions: [
      'Original Goal: Dream Bike (₹8 Lakh by Mar 2029)',
      'Current SIP: ₹4,000/month',
      'Recalibrates contribution requirements to match new parameters',
      'User maintains full freedom to adjust or exit',
    ],
  },
  just_checking: {
    id: 'just_checking',
    label: 'Just checking',
    badgeLabel: 'Quick Snapshot',
    headline: "Just checking? Here's a quick look.",
    supportingCopy: "Here's a quick snapshot of what changing your SIP could mean with minimal friction.",
    aiInsightMessage: "Here's a quick snapshot of what changing your SIP could mean.",
    simulatorFocus: 'light_snapshot',
    decisionOptionsOrder: ['continue', 'skip-1', 'reduce-3000', 'pause-6'],
    defaultSelectedOptionId: 'continue',
    primaryActionLabel: 'Continue with SIP',
    secondaryActionLabel: 'Explore options',
    allowDirectPause: true,
    directPauseLabel: 'Pause SIP',
    explainabilityNote: 'Fast overview for exploratory checks. A 1-month pause creates a ₹4,000 gap with minimal ~0–1 month timeline impact.',
    assumptions: [
      'Hypothetical 1-month pause: ₹4,000 gap',
      'Projected goal impact: minimal (~0–1 month shift)',
      'Instant 1-click continuation without friction',
      'Full ladder exploration available on demand',
    ],
  },
};

export const intentReasonsList = [
  {
    id: 'cash_need' as IntentId,
    label: 'I need the money',
    iconName: 'Wallet',
    description: 'Sudden expense, medical bill or tighter cash flow',
  },
  {
    id: 'market_fear' as IntentId,
    label: 'Worried about the market',
    iconName: 'TrendingDown',
    description: 'Recent dip, volatility or fear of downturn',
  },
  {
    id: 'performance_doubt' as IntentId,
    label: "Not sure it's working",
    iconName: 'IndianRupee',
    description: 'Returns feel slow or lagging expectations',
  },
  {
    id: 'goal_change' as IntentId,
    label: 'Goal changed or switching',
    iconName: 'Target',
    description: 'Timeline shifted or prioritizing another goal',
  },
  {
    id: 'just_checking' as IntentId,
    label: 'Just checking',
    iconName: 'MoreHorizontal',
    description: 'Exploring options without immediate intention to stop',
  },
];

export function getIntentConfig(intentId: IntentId, goal?: GoalDetails): IntentConfiguration {
  const base = intentConfigurations[intentId] || intentConfigurations.market_fear;
  if (!goal) return base;

  const targetLakh = goal.targetAmount >= 100000 
    ? `₹${(goal.targetAmount / 100000).toFixed(goal.targetAmount % 100000 === 0 ? 0 : 1)} Lakh` 
    : `₹${goal.targetAmount.toLocaleString('en-IN')}`;
  
  const fundedPct = ((goal.currentSavings / (goal.targetAmount || 1)) * 100).toFixed(1);
  const monthlySipVal = goal.linkedSIPAmount || goal.monthlyContribution || 4000;
  const monthlySipStr = `₹${monthlySipVal.toLocaleString('en-IN')}`;
  const currentSavingsStr = `₹${goal.currentSavings.toLocaleString('en-IN')}`;

  return {
    ...base,
    aiInsightMessage: base.aiInsightMessage
      .replace('Mar 2029 goal', `${goal.targetDate} (${goal.name}) goal`),
    explainabilityNote: base.explainabilityNote
      .replace('Mar 2029 goal', `${goal.targetDate} (${goal.name}) goal`)
      .replace('₹8 Lakh target', `${targetLakh} target`)
      .replace('₹4,000/month toward your Mar 2029 goal', `${monthlySipStr}/month toward your ${goal.targetDate} (${goal.name}) goal`)
      .replace('₹4,000 gap', `${monthlySipStr} gap`),
    assumptions: base.assumptions.map((item) =>
      item
        .replace('₹8 Lakh by Mar 2029 (Dream Bike)', `${targetLakh} by ${goal.targetDate} (${goal.name})`)
        .replace('Dream Bike (₹8 Lakh by Mar 2029)', `${goal.name} (${targetLakh} by ${goal.targetDate})`)
        .replace('₹8 Lakh target', `${targetLakh} target`)
        .replace('14.8% of ₹8L target reached on schedule', `${fundedPct}% of ${targetLakh} target reached on schedule`)
        .replace('Mar 2029 (30 months remaining)', `${goal.targetDate} (${goal.monthsRemaining || 30} months remaining)`)
        .replace('Current SIP: ₹4,000/month', `Current SIP: ${monthlySipStr}/month`)
        .replace('Monthly contribution: ₹4,000', `Monthly contribution: ${monthlySipStr}`)
        .replace('₹4,000 gap', `${monthlySipStr} gap`)
        .replace('Current portfolio value: ₹1,18,420', `Current portfolio value: ${currentSavingsStr}`)
    ),
  };
}
