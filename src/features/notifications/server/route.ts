import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";
import { z } from "zod";

import { sessionMiddleware } from "@/src/lib/session-middleware";
import { DATABASE_ID, NOTIFICATIONS_ID } from "@/src/config";

import { listNotificationsQuerySchema } from "../schemas";
import type { Notification } from "../types";

const app = new Hono()
  // GET /api/notifications?filter=all|unread|starred
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", listNotificationsQuerySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { filter } = c.req.valid("query");

      const query = [
        Query.equal("userId", user.$id),
        Query.isNull("archivedAt"),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ];

      if (filter === "unread") {
        query.push(Query.isNull("readAt"));
      } else if (filter === "starred") {
        query.push(Query.isNotNull("starredAt"));
      }

      const notifications = await databases.listDocuments<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        query
      );

      return c.json({
        data: {
          documents: notifications.documents,
          total: notifications.total,
        },
      });
    }
  )
  // POST /api/notifications/:notificationId/read
  .post(
    "/:notificationId/read",
    sessionMiddleware,
    zValidator("param", z.object({ notificationId: z.string() })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { notificationId } = c.req.valid("param");

      // Verify ownership
      const notification = await databases.getDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId
      );

      if (notification.userId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updated = await databases.updateDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId,
        {
          readAt: new Date().toISOString(),
        }
      );

      return c.json({ data: updated });
    }
  )
  // POST /api/notifications/:notificationId/star
  .post(
    "/:notificationId/star",
    sessionMiddleware,
    zValidator("param", z.object({ notificationId: z.string() })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { notificationId } = c.req.valid("param");

      // Verify ownership
      const notification = await databases.getDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId
      );

      if (notification.userId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Toggle star
      const newStarredAt = notification.starredAt
        ? undefined
        : new Date().toISOString();

      const updated = await databases.updateDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId,
        {
          starredAt: newStarredAt,
        }
      );

      return c.json({ data: updated });
    }
  )
  // POST /api/notifications/:notificationId/archive
  .post(
    "/:notificationId/archive",
    sessionMiddleware,
    zValidator("param", z.object({ notificationId: z.string() })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { notificationId } = c.req.valid("param");

      // Verify ownership
      const notification = await databases.getDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId
      );

      if (notification.userId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updated = await databases.updateDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId,
        {
          archivedAt: new Date().toISOString(),
        }
      );

      return c.json({ data: updated });
    }
  );

export default app;
