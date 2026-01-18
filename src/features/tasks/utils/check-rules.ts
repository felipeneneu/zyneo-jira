import { Query, type Databases } from "node-appwrite";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID } from "@/src/config";
import type { Task, TaskStatus } from "../types";
import {
  upsertNotification,
  archiveNotificationByThreadKey,
} from "@/src/features/notifications/utils/upsert-notification";

const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours
const STALE_CRITICAL_THRESHOLD_MS = 96 * 60 * 60 * 1000; // 96 hours (4 days)
const OVERDUE_CRITICAL_THRESHOLD_DAYS = 3;

interface RuleCheckResult {
  tasksChecked: number;
  staleFound: number;
  overdueFound: number;
  flagsUpdated: number;
}

/**
 * Check stale/overdue rules for tasks in a workspace.
 * Called lazily on task list fetch.
 */
export async function checkRulesForWorkspace(
  databases: Databases,
  workspaceId: string,
  now: Date = new Date()
): Promise<RuleCheckResult> {
  const result: RuleCheckResult = {
    tasksChecked: 0,
    staleFound: 0,
    overdueFound: 0,
    flagsUpdated: 0,
  };

  // Fetch tasks that are not done (limit to 200 for performance)
  const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
    Query.equal("workspaceId", workspaceId),
    Query.notEqual("status", "DONE"),
    Query.limit(200),
  ]);

  result.tasksChecked = tasks.documents.length;
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  for (const task of tasks.documents) {
    const currentFlags = task.flags ?? [];
    let newFlags = [...currentFlags];
    let flagsChanged = false;

    // Get assignee userId for notifications
    let assigneeUserId: string | null = null;
    if (task.assigneeId) {
      try {
        const member = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          task.assigneeId
        );
        assigneeUserId = member.userId;
      } catch {
        // Member not found, skip notifications for this task
      }
    }

    // ========== STALE RULE ==========
    // Applies to IN_PROGRESS or IN_REVIEW tasks with no recent activity
    const isStaleEligible =
      task.status === ("IN_PROGRESS" as TaskStatus) ||
      task.status === ("IN_REVIEW" as TaskStatus);

    if (isStaleEligible && task.lastActivityAt) {
      const lastActivity = new Date(task.lastActivityAt);
      const timeSinceActivity = now.getTime() - lastActivity.getTime();

      if (timeSinceActivity >= STALE_THRESHOLD_MS) {
        // Task is stale
        if (!newFlags.includes("stale")) {
          newFlags.push("stale");
          flagsChanged = true;
        }
        result.staleFound++;

        // Create notification for assignee
        if (assigneeUserId) {
          const daysSinceActivity = Math.floor(
            timeSinceActivity / (24 * 60 * 60 * 1000)
          );
          const severity =
            timeSinceActivity >= STALE_CRITICAL_THRESHOLD_MS
              ? "critical"
              : "warn";

          await upsertNotification({
            databases,
            userId: assigneeUserId,
            workspaceId,
            type: "system.stale",
            severity,
            title: "Tarefa parada",
            snippet: `${task.taskKey ?? task.name} está sem atividade há ${daysSinceActivity} dias`,
            entityType: "task",
            entityId: task.$id,
            threadKey: `task:${task.$id}`,
          });
        }
      } else {
        // No longer stale - remove flag and archive notification
        if (newFlags.includes("stale")) {
          newFlags = newFlags.filter((f) => f !== "stale");
          flagsChanged = true;

          if (assigneeUserId) {
            await archiveNotificationByThreadKey(
              databases,
              assigneeUserId,
              "system.stale",
              `task:${task.$id}`
            );
          }
        }
      }
    } else if (!isStaleEligible && newFlags.includes("stale")) {
      // Task status changed to non-eligible - clear stale
      newFlags = newFlags.filter((f) => f !== "stale");
      flagsChanged = true;

      if (assigneeUserId) {
        await archiveNotificationByThreadKey(
          databases,
          assigneeUserId,
          "system.stale",
          `task:${task.$id}`
        );
      }
    }

    // ========== OVERDUE RULE ==========
    // Applies to tasks with dueDate in the past and not done
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < todayStart) {
        // Task is overdue
        if (!newFlags.includes("overdue")) {
          newFlags.push("overdue");
          flagsChanged = true;
        }
        result.overdueFound++;

        // Create notification for assignee
        if (assigneeUserId) {
          const daysOverdue = Math.floor(
            (todayStart.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          const severity =
            daysOverdue >= OVERDUE_CRITICAL_THRESHOLD_DAYS ? "critical" : "warn";

          await upsertNotification({
            databases,
            userId: assigneeUserId,
            workspaceId,
            type: "system.overdue",
            severity,
            title: "Tarefa atrasada",
            snippet: `${task.taskKey ?? task.name} está atrasada há ${daysOverdue} dia(s)`,
            entityType: "task",
            entityId: task.$id,
            threadKey: `task:${task.$id}`,
          });
        }
      } else {
        // Not overdue anymore - remove flag and archive notification
        if (newFlags.includes("overdue")) {
          newFlags = newFlags.filter((f) => f !== "overdue");
          flagsChanged = true;

          if (assigneeUserId) {
            await archiveNotificationByThreadKey(
              databases,
              assigneeUserId,
              "system.overdue",
              `task:${task.$id}`
            );
          }
        }
      }
    }

    // Update task flags if changed
    if (flagsChanged) {
      try {
        await databases.updateDocument(DATABASE_ID, TASKS_ID, task.$id, {
          flags: newFlags,
        });
        result.flagsUpdated++;
      } catch {
        // Ignore update errors (may happen if task was deleted concurrently)
      }
    }
  }

  return result;
}
