import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.string().min(1),
  type: z.enum(["comment", "progress", "blocked", "decision"]),
  content: z.string().min(1).max(5000),
});

export const listCommentsQuerySchema = z.object({
  taskId: z.string().min(1),
});
