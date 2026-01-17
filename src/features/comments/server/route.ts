import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/src/lib/session-middleware";
import { getMember } from "@/src/features/members/utils";
import { createAdminClient } from "@/src/lib/appwrite";
import {
  DATABASE_ID,
  MEMBERS_ID,
  TASK_COMMENTS_ID,
  TASKS_ID,
} from "@/src/config";

import { createCommentSchema, listCommentsQuerySchema } from "../schemas";
import type { TaskComment } from "../types";
import type { Task } from "@/src/features/tasks/types";
import { upsertNotification } from "@/src/features/notifications/utils/upsert-notification";

/**
 * Parse @mentions from content and return array of member IDs.
 * Format: @[username](memberId)
 */
function parseMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // the memberId in parentheses
  }
  return mentions;
}

const app = new Hono()
  // GET /api/comments?taskId=xxx
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", listCommentsQuerySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { taskId } = c.req.valid("query");

      // Get task to verify access
      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { users } = await createAdminClient();

      const comments = await databases.listDocuments<TaskComment>(
        DATABASE_ID,
        TASK_COMMENTS_ID,
        [Query.equal("taskId", taskId), Query.orderAsc("$createdAt")]
      );

      // Enrich with author info
      const enrichedComments = await Promise.all(
        comments.documents.map(async (comment) => {
          try {
            const author = await users.get(comment.authorId);
            return {
              ...comment,
              authorName: author.name,
              authorEmail: author.email,
            };
          } catch {
            return {
              ...comment,
              authorName: "Unknown",
              authorEmail: "",
            };
          }
        })
      );

      return c.json({
        data: {
          documents: enrichedComments,
          total: comments.total,
        },
      });
    }
  )
  // POST /api/comments
  .post("/", sessionMiddleware, zValidator("json", createCommentSchema), async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { taskId, type, content } = c.req.valid("json");

    // Get task to verify access and get context
    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Parse mentions from content
    const mentionedUserIds = parseMentions(content);

    // Create comment
    const comment = await databases.createDocument<TaskComment>(
      DATABASE_ID,
      TASK_COMMENTS_ID,
      ID.unique(),
      {
        taskId,
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        authorId: user.$id,
        type,
        content,
        mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      }
    );

    // Update task: lastActivityAt and flags
    const updatePayload: Record<string, unknown> = {
      lastActivityAt: new Date().toISOString(),
    };

    // Handle flags based on comment type
    const currentFlags = (task.flags as string[] | undefined) ?? [];
    let newFlags = [...currentFlags];

    if (type === "blocked") {
      // Add blocked flag if not present
      if (!newFlags.includes("blocked")) {
        newFlags.push("blocked");
      }
    } else if (type === "progress") {
      // Remove stale flag if user is working on it
      newFlags = newFlags.filter((f) => f !== "stale");
    }

    // Only update flags if changed
    if (JSON.stringify(newFlags) !== JSON.stringify(currentFlags)) {
      updatePayload.flags = newFlags;
    }

    await databases.updateDocument(DATABASE_ID, TASKS_ID, taskId, updatePayload);

    // Create notifications for mentions
    if (mentionedUserIds.length > 0) {
      const { users } = await createAdminClient();
      const authorName = user.name ?? "Someone";
      const taskKey = task.taskKey ?? task.$id;

      for (const mentionedMemberId of mentionedUserIds) {
        try {
          // Get the member's userId
          const mentionedMember = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            mentionedMemberId
          );

          // Skip if the author is mentioning themselves
          if (mentionedMember.userId === user.$id) continue;

          await upsertNotification({
            databases,
            userId: mentionedMember.userId,
            workspaceId: task.workspaceId,
            type: "human.mention",
            severity: "info",
            title: `${authorName} mencionou você`,
            snippet: `${taskKey}: ${content.slice(0, 100)}${content.length > 100 ? "..." : ""}`,
            entityType: "task",
            entityId: taskId,
            threadKey: `mention:${taskId}:${comment.$id}`,
          });
        } catch {
          // Skip if member not found
        }
      }
    }

    return c.json({ data: comment });
  });

export default app;
