import { z } from "zod";

import {
  WORKSPACE_MAIN_GOALS,
  WORKSPACE_TEAM_SIZES,
  WORKSPACE_TYPES,
  WORKSPACE_WORKFLOW_STYLES,
} from "@/src/features/workspaces/types";

export const step1Schema = z.object({
  type: z.enum(WORKSPACE_TYPES),
});

export const step3Schema = z.object({
  workflowStyle: z.enum(WORKSPACE_WORKFLOW_STYLES),
  teamSize: z.enum(WORKSPACE_TEAM_SIZES),
  mainGoal: z.enum(WORKSPACE_MAIN_GOALS),
});

export const step2Schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Name too long"),
  description: z.string().optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
