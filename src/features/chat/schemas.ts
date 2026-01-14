import { z } from "zod";

export const listMessagesQuerySchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1).nullish(),
  cursor: z.string().min(1).nullish(),
  limit: z.coerce.number().int().min(1).max(100).nullish(),
});

export const createMessageSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1).nullish(),
  body: z.string().trim().min(1).max(2000),
  bodyLexical: z.string().trim().min(1).max(20000).optional(),
});

export const markReadSchema = z.object({
  workspaceId: z.string().min(1),
});

export const unreadQuerySchema = z.object({
  workspaceId: z.string().min(1),
});
