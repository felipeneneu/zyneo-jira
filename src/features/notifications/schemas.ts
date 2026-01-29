import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  filter: z.enum(["all", "unread", "starred"]).optional().default("all"),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const notificationIdParamSchema = z.object({
  notificationId: z.string().min(1),
});
