import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { GoalDetails } from '../types';
import { 
  getGoals as fetchStoredGoals, 
  getPrimaryGoal as fetchStoredPrimaryGoal, 
  setPrimaryGoal as persistPrimaryGoal, 
  saveGoal as persistGoal, 
  createGoal as persistNewGoal, 
  deleteGoal as persistDeleteGoal,
  getLinkedSip,
  getDynamicDecisionOptions
} from '../services/goalsService';
import { GoalsContext } from './goalsContextDef';

interface GoalsProviderProps {
  children: ReactNode;
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<GoalDetails[]>(() => fetchStoredGoals());
  const [primaryGoal, setPrimaryGoalState] = useState<GoalDetails>(() => fetchStoredPrimaryGoal());

  // Keep in sync with storage or state changes
  const refreshGoals = () => {
    const loaded = fetchStoredGoals();
    setGoals(loaded);
    setPrimaryGoalState(fetchStoredPrimaryGoal());
  };

  const handleSetPrimaryGoal = (goalId: string) => {
    const updatedPrimary = persistPrimaryGoal(goalId);
    setPrimaryGoalState(updatedPrimary);
    setGoals(fetchStoredGoals());
  };

  const handleSaveGoal = (goal: GoalDetails) => {
    const updated = persistGoal(goal);
    setGoals(updated);
    setPrimaryGoalState(fetchStoredPrimaryGoal());
  };

  const handleCreateGoal = (goalData: Omit<GoalDetails, 'id'>) => {
    const created = persistNewGoal(goalData);
    setGoals(fetchStoredGoals());
    if (created.isPrimary) {
      setPrimaryGoalState(created);
    }
    return created;
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = persistDeleteGoal(goalId);
    setGoals(updated);
    setPrimaryGoalState(fetchStoredPrimaryGoal());
  };

  // Derive linked SIP from the current primary goal
  const linkedSIP = useMemo(() => {
    return getLinkedSip(primaryGoal);
  }, [primaryGoal]);

  // Derive dynamic decision options from the current primary goal
  const decisionOptions = useMemo(() => {
    return getDynamicDecisionOptions(primaryGoal);
  }, [primaryGoal]);

  // Listen to window storage events if modified in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'finlit_user_goals' || e.key === 'finlit_primary_goal_id') {
        refreshGoals();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <GoalsContext.Provider
      value={{
        goals,
        primaryGoal,
        linkedSIP,
        decisionOptions,
        setPrimaryGoal: handleSetPrimaryGoal,
        saveGoal: handleSaveGoal,
        createGoal: handleCreateGoal,
        deleteGoal: handleDeleteGoal,
        refreshGoals,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};
