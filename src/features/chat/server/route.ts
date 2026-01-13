import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/src/lib/session-middleware";
import { getMember } from "@/src/features/members/utils";
import { DATABASE_ID, CHAT_MESSAGES_ID, MEMBERS_ID } from "@/src/config";

import {
  createMessageSchema,
  listMessagesQuerySchema,
  markReadSchema,
  unreadQuerySchema,
} from "../schemas";
import type { ChatMessage } from "../types";

const DEFAULT_LIMIT = 50;

const app = new Hono()
  .get(
    "/messages",
    sessionMiddleware,
    zValidator("query", listMessagesQuerySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, projectId, cursor, limit } = c.req.valid("query");

      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const safeLimit = limit ?? DEFAULT_LIMIT;

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
        Query.limit(safeLimit),
      ];

      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (cursor) {
        query.push(Query.cursorAfter(cursor));
      }

      const messages = await databases.listDocuments<ChatMessage>(
        DATABASE_ID,
        CHAT_MESSAGES_ID,
        query
      );

      const nextCursor =
        messages.documents.length === safeLimit && messages.documents.length > 0
          ? messages.documents[messages.documents.length - 1].$id
          : null;

      return c.json({
        data: {
          documents: messages.documents,
          total: messages.total,
          nextCursor,
        },
      });
    }
  )
  .post(
    "/messages",
    sessionMiddleware,
    zValidator("json", createMessageSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId, projectId, body } = c.req.valid("json");

      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const senderAvatarUrl = (user as any)?.prefs?.avatarUrl as string | undefined;

      const message = await databases.createDocument<ChatMessage>(
        DATABASE_ID,
        CHAT_MESSAGES_ID,
        ID.unique(),
        {
          workspaceId,
          projectId: projectId ?? undefined,
          userId: user.$id,
          body,
          senderName: user.name ?? "User",
          senderAvatarUrl: senderAvatarUrl ?? undefined,
        }
      );

      try {
        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, member.$id, {
          chatLastReadAt: new Date().toISOString(),
        });
      } catch {}

      return c.json({ data: message });
    }
  )
  .post(
    "/mark-read",
    sessionMiddleware,
    zValidator("json", markReadSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("json");

      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, member.$id, {
          chatLastReadAt: new Date().toISOString(),
        });
      } catch {}

      return c.json({ data: { success: true } });
    }
  )
  .get(
    "/realtime-token",
    sessionMiddleware,
    async (c) => {
      const account = c.get("account");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const jwt = await account.createJWT();

      return c.json({ data: { jwt: jwt.jwt } });
    }
  )
  .get(
    "/unread",
    sessionMiddleware,
    zValidator("query", unreadQuerySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const last = await databases.listDocuments<ChatMessage>(
        DATABASE_ID,
        CHAT_MESSAGES_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]
      );

      const lastMessage = last.documents[0];
      if (!lastMessage) {
        return c.json({ data: { unread: false, lastMessageAt: null } });
      }

      const lastMessageAt = lastMessage.$createdAt;
      const lastReadAt = (member as any)?.chatLastReadAt as string | undefined;
      const unreadQuery = [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("userId", user.$id),
        Query.limit(1),
      ];

      if (lastReadAt) {
        unreadQuery.push(Query.greaterThan("$createdAt", lastReadAt));
      }

      const unreadDocs = await databases.listDocuments<ChatMessage>(
        DATABASE_ID,
        CHAT_MESSAGES_ID,
        unreadQuery
      );

      const count = unreadDocs.total ?? 0;
      const unread = count > 0;

      return c.json({ data: { unread, count, lastMessageAt } });
    }
  );

export default app;
