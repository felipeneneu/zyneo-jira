import type { WorkspaceType } from "../types";

export type WorkspaceCapability =
  | "nav.home"
  | "nav.tasks"
  | "nav.chat"
  | "nav.members"
  | "nav.settings"
  | "nav.dev"
  | "projects"
  | "backlog"
  | "sprints"
  | "calendar"
  | "reports"
  | "automations"
  | "docs"
  | "diagrams"
  | "audit"
  | "exports"
  | "assets"
  | "approvals"
  | "sop"
  | "kpis"
  | "crm"
  | "pipeline";

export type WorkspaceTool =
  | "github"
  | "slack"
  | "jira"
  | "trello"
  | "google_drive"
  | "teams"
  | "notion"
  | "asana"
  | "figma"
  | "zoom"
  | "wrike"
  | "salesforce";

export type WorkspacePreset = {
  capabilities: WorkspaceCapability[];
  tools: WorkspaceTool[];
  agentProfileSlug: string;
};

const BASE_CAPABILITIES: WorkspaceCapability[] = [
  "nav.home",
  "nav.tasks",
  "nav.chat",
  "nav.members",
  "nav.settings",
  "projects",
];

export const WORKSPACE_PRESETS: Record<WorkspaceType, WorkspacePreset> = {
  software_dev: {
    capabilities: [
      ...BASE_CAPABILITIES,
      "nav.dev",
      "backlog",
      "sprints",
      "reports",
      "docs",
      "diagrams",
      "audit",
      "exports",
      "automations",
    ],
    tools: ["github", "jira", "slack", "notion", "google_drive"],
    agentProfileSlug: "software-dev",
  },
  design: {
    capabilities: [
      ...BASE_CAPABILITIES,
      "assets",
      "approvals",
      "docs",
      "reports",
    ],
    tools: ["figma", "slack", "notion", "google_drive", "zoom"],
    agentProfileSlug: "design",
  },
  operations: {
    capabilities: [
      ...BASE_CAPABILITIES,
      "sop",
      "kpis",
      "reports",
      "automations",
    ],
    tools: ["slack", "teams", "notion", "asana", "zoom"],
    agentProfileSlug: "operations",
  },
  sales_crm: {
    capabilities: [
      ...BASE_CAPABILITIES,
      "crm",
      "pipeline",
      "reports",
      "automations",
    ],
    tools: ["salesforce", "slack", "teams", "zoom", "google_drive"],
    agentProfileSlug: "sales-crm",
  },
};

export const getWorkspacePreset = (workspaceType?: WorkspaceType | null) => {
  if (!workspaceType) return null;
  return WORKSPACE_PRESETS[workspaceType] ?? null;
};

export const mergeWorkspaceTools = (
  presetTools: WorkspaceTool[] = [],
  selectedTools?: string[]
) => {
  const merged = new Set<string>([...presetTools, ...(selectedTools ?? [])]);
  return merged.size ? Array.from(merged) : undefined;
};
