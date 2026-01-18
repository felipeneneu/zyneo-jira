import { Query, type Databases } from "node-appwrite";
import { DATABASE_ID, NOTIFICATIONS_ID } from "@/src/config";
import type {
  Notification,
  NotificationType,
  NotificationSeverity,
  NotificationEntityType,
} from "../types";

export interface UpsertNotificationParams {
  databases: Databases;
  userId: string;
  workspaceId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  snippet: string;
  entityType: NotificationEntityType;
  entityId: string;
  threadKey: string;
}

/**
 * Upsert notification by (userId, type, threadKey).
 * If exists and not archived: update title/snippet/severity and clear readAt.
 * Else: create new notification.
 */
export async function upsertNotification(
  params: UpsertNotificationParams
): Promise<Notification> {
  const {
    databases,
    userId,
    workspaceId,
    type,
    severity,
    title,
    snippet,
    entityType,
    entityId,
    threadKey,
  } = params;

  // Find existing notification by (userId, type, threadKey) that is not archived
  const existing = await databases.listDocuments<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    [
      Query.equal("userId", userId),
      Query.equal("type", type),
      Query.equal("threadKey", threadKey),
      Query.isNull("archivedAt"),
      Query.limit(1),
    ]
  );

  if (existing.documents.length > 0) {
    // Update existing notification
    const doc = existing.documents[0];
    return await databases.updateDocument<Notification>(
      DATABASE_ID,
      NOTIFICATIONS_ID,
      doc.$id,
      {
        severity,
        title,
        snippet,
        readAt: undefined, // Clear readAt to mark as unread again
      }
    );
  }

  // Create new notification
  const { ID } = await import("node-appwrite");
  return await databases.createDocument<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    ID.unique(),
    {
      userId,
      workspaceId,
      type,
      severity,
      title,
      snippet,
      entityType,
      entityId,
      threadKey,
    }
  );
}

/**
 * Archive notification for a specific threadKey when the condition is resolved.
 */
export async function archiveNotificationByThreadKey(
  databases: Databases,
  userId: string,
  type: NotificationType,
  threadKey: string
): Promise<void> {
  const existing = await databases.listDocuments<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    [
      Query.equal("userId", userId),
      Query.equal("type", type),
      Query.equal("threadKey", threadKey),
      Query.isNull("archivedAt"),
      Query.limit(1),
    ]
  );

  if (existing.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      NOTIFICATIONS_ID,
      existing.documents[0].$id,
      {
        archivedAt: new Date().toISOString(),
      }
    );
  }
}
