import { z } from "zod";
import {
  WORKSPACE_MAIN_GOALS,
  WORKSPACE_PURPOSES,
  WORKSPACE_STATUSES,
  WORKSPACE_TEAM_SIZES,
  WORKSPACE_TYPES,
  WORKSPACE_WORKFLOW_STYLES,
} from "./types";

const stringArraySchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return undefined;
  },
  z.array(z.string())
);

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  purpose: z.enum(WORKSPACE_PURPOSES).optional(),
  workspaceType: z.enum(WORKSPACE_TYPES).optional(),
  teamSize: z.enum(WORKSPACE_TEAM_SIZES).optional(),
  workflowStyle: z.enum(WORKSPACE_WORKFLOW_STYLES).optional(),
  mainGoal: z.enum(WORKSPACE_MAIN_GOALS).optional(),
  workspaceStatus: z.enum(WORKSPACE_STATUSES).optional(),
  capabilities: stringArraySchema.optional(),
  tools: stringArraySchema.optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Must be 1 or more characters").optional(),
  purpose: z.enum(WORKSPACE_PURPOSES).optional(),
  workspaceType: z.enum(WORKSPACE_TYPES).optional(),
  teamSize: z.enum(WORKSPACE_TEAM_SIZES).optional(),
  workflowStyle: z.enum(WORKSPACE_WORKFLOW_STYLES).optional(),
  mainGoal: z.enum(WORKSPACE_MAIN_GOALS).optional(),
  workspaceStatus: z.enum(WORKSPACE_STATUSES).optional(),
  capabilities: stringArraySchema.optional(),
  tools: stringArraySchema.optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

