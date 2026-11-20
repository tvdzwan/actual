import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type TrackingBudgetContextDefinition = {
  summaryCollapsed: boolean;
  onBudgetAction: (month: string, action: string, arg?: unknown) => void;
  onToggleSummaryCollapse: () => void;
  currentMonth: string;
};

const TrackingBudgetContext = createContext<TrackingBudgetContextDefinition>({
  summaryCollapsed: false,
  onBudgetAction: () => {
    throw new Error('Unitialised context method called: onBudgetAction');
  },
  onToggleSummaryCollapse: () => {
    throw new Error(
      'Unitialised context method called: onToggleSummaryCollapse',
    );
  },
  currentMonth: 'unknown',
});

type TrackingBudgetProviderProps = TrackingBudgetContextDefinition & {
  children: ReactNode;
};
export function TrackingBudgetProvider({
  summaryCollapsed,
  currentMonth,
  onBudgetAction,
  onToggleSummaryCollapse,
  children,
}: TrackingBudgetProviderProps) {
  return (
    <TrackingBudgetContext.Provider
      value={{
        currentMonth,
        summaryCollapsed,
        onBudgetAction,
        onToggleSummaryCollapse,
      }}
    >
      {children}
    </TrackingBudgetContext.Provider>
  );
}

export function useTrackingBudget() {
  return useContext(TrackingBudgetContext);
}
