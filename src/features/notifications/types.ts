import { Models } from "node-appwrite";

export type NotificationType =
  | "task.overdue"
  | "task.stale"
  | "task.blocked"
  | "system.stale"
  | "system.overdue"
  | "system.daily_focus"
  | "human.mention";

export type NotificationSeverity = "info" | "warn" | "critical";

export type NotificationEntityType = "task" | "workspace";

export type Notification = Models.Document & {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  snippet: string;
  entityType: NotificationEntityType;
  entityId: string;
  threadKey: string;
  readAt?: string;
  archivedAt?: string;
  starredAt?: string;
};
