import type {
  WorkspaceMainGoal,
  WorkspacePurpose,
  WorkspaceTeamSize,
  WorkspaceType,
  WorkspaceWorkflowStyle,
} from "@/src/features/workspaces/types";

export type {
  WorkspacePurpose,
  WorkspaceType,
  WorkspaceTeamSize as TeamSize,
  WorkspaceWorkflowStyle as WorkflowStyle,
  WorkspaceMainGoal as MainGoal,
} from "@/src/features/workspaces/types";

export interface WorkspaceOnboardingState {
  step: number;
  totalSteps: number;
  purpose: WorkspacePurpose | null;
  type: WorkspaceType | null;
  teamSize: WorkspaceTeamSize;
  mainGoal: WorkspaceMainGoal;
  workflowStyle: WorkspaceWorkflowStyle;
  name: string;
  image?: File | string;
  invites: string[];
  tools: string[];
}

export type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_PURPOSE"; payload: WorkspacePurpose }
  | { type: "SET_TYPE"; payload: WorkspaceType }
  | {
      type: "SET_METHODOLOGY";
      payload: {
        teamSize: WorkspaceTeamSize;
        mainGoal: WorkspaceMainGoal;
        workflowStyle: WorkspaceWorkflowStyle;
      };
    }
  | { type: "SET_IDENTITY"; payload: { name: string; image?: File | string } }
  | { type: "SET_INVITES"; payload: string[] }
  | { type: "SET_TOOLS"; payload: string[] }
  | { type: "RESET" };
