import { createContext } from 'react';
import { GoalDetails, SIPDetails, DecisionOption, DecisionOptionId } from '../types';

export interface GoalsContextType {
  goals: GoalDetails[];
  primaryGoal: GoalDetails;
  linkedSIP: SIPDetails;
  decisionOptions: Record<DecisionOptionId, DecisionOption>;
  setPrimaryGoal: (goalId: string) => void;
  saveGoal: (goal: GoalDetails) => void;
  createGoal: (goalData: Omit<GoalDetails, 'id'>) => GoalDetails;
  deleteGoal: (goalId: string) => void;
  refreshGoals: () => void;
}

export const GoalsContext = createContext<GoalsContextType | undefined>(undefined);
