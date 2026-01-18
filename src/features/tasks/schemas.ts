import z from "zod/v3";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.coerce.date(),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
  documentation: z.string().optional(),
  diagramUrl: z.string().trim().optional(),
  githubPrs: z.array(z.string().trim()).optional(),
  completedAt: z.coerce.date().optional(),
});
