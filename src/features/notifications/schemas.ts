import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  filter: z.enum(["all", "unread", "starred"]).optional().default("all"),
});

export const notificationIdParamSchema = z.object({
  notificationId: z.string().min(1),
});
