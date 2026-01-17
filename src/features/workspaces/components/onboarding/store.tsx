"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WorkspaceOnboardingState, WizardAction } from './types';

const initialState: WorkspaceOnboardingState = {
  step: 1,
  totalSteps: 2,
  purpose: null,
  type: null,
  teamSize: "solo",
  mainGoal: "organize",
  workflowStyle: "simple",
  name: '',
  description: '',
  invites: [],
  tools: [],
};

function wizardReducer(state: WorkspaceOnboardingState, action: WizardAction): WorkspaceOnboardingState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, step: Math.min(state.step + 1, state.totalSteps) };
    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 1) };
    case "SET_PURPOSE":
      return { ...state, purpose: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_METHODOLOGY":
      return { ...state, ...action.payload };
    case "SET_IDENTITY":
      return { ...state, ...action.payload };
    case "SET_INVITES":
      return { ...state, invites: action.payload };
    case "SET_TOOLS":
      return { ...state, tools: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WorkspaceOnboardingState;
  dispatch: React.Dispatch<WizardAction>;
} | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
