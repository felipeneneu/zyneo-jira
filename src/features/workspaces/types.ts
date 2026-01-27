import { Models } from "node-appwrite";

export const WORKSPACE_PURPOSES = ["work", "personal", "school"] as const;
export type WorkspacePurpose = (typeof WORKSPACE_PURPOSES)[number];

export const WORKSPACE_TYPES = [
  "software_dev",
  "design",
  "operations",
  "sales_crm",
] as const;
export type WorkspaceType = (typeof WORKSPACE_TYPES)[number];

export const WORKSPACE_TEAM_SIZES = [
  "solo",
  "small",
  "medium",
  "large",
  "enterprise",
] as const;
export type WorkspaceTeamSize = (typeof WORKSPACE_TEAM_SIZES)[number];

export const WORKSPACE_WORKFLOW_STYLES = [
  "kanban",
  "simple",
  "scrum",
  "custom",
] as const;
export type WorkspaceWorkflowStyle = (typeof WORKSPACE_WORKFLOW_STYLES)[number];

export const WORKSPACE_MAIN_GOALS = [
  "organize",
  "deliver",
  "sell",
  "standardize",
] as const;
export type WorkspaceMainGoal = (typeof WORKSPACE_MAIN_GOALS)[number];

export const WORKSPACE_ROLES = ["owner", "admin", "manager", "member"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const WORKSPACE_STATUSES = [
  "draft",
  "active",
  "suspended",
  "archived",
] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export const WORKSPACE_DESCRIPTIONS = [
  "Software Development",
  "Marketing",
  "Sales",
  "Personal",
  "Education",
  "Other",
] as const;
export type WorkspaceDescription = (typeof WORKSPACE_DESCRIPTIONS)[number];

export type WorkspaceOnboardingDraft = {
  name: string;
  slug?: string;
  description?: string;
  purpose?: WorkspacePurpose;
  workspaceType?: WorkspaceType;
  teamSize?: WorkspaceTeamSize;
  workflowStyle?: WorkspaceWorkflowStyle;
  mainGoal?: WorkspaceMainGoal;
  roles?: WorkspaceRole[];
  workspaceStatus?: WorkspaceStatus;
  capabilities?: string[];
  tools?: string[];
  agentProfileId?: string;
  workflowPreset?: string;
};

export type Workspace = Models.Document & {
  name: string;
  imageUrl: string;
  inviteCode: string;
  userId: string;
  slug?: string;
  description?: string;
  purpose?: WorkspacePurpose;
  workspaceType?: WorkspaceType;
  teamSize?: WorkspaceTeamSize;
  workflowStyle?: WorkspaceWorkflowStyle;
  mainGoal?: WorkspaceMainGoal;
  roles?: WorkspaceRole[];
  workspaceStatus?: WorkspaceStatus;
  capabilities?: string[];
  tools?: string[];
  agentProfileId?: string;
  workflowPreset?: string;
};
