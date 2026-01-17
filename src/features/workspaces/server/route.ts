import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/src/lib/session-middleware";
import { z } from "zod";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  TASKS_ID,
  WORKSPACE_ID,
} from "@/src/config";
import { ID, Query, type Databases } from "node-appwrite";
import { MemberRole } from "../../members/types";
import { generateInviteCode } from "@/src/lib/utils";
import { getMember } from "../../members/utils";
import { Workspace } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "../../tasks/types";
import { resolveWorkspaceConfig } from "./use-cases/resolve-workspace-config";
import { resolveAgentProfileId } from "./use-cases/resolve-agent-profile-id";
import { slugify } from "@/src/lib/utils";
import { resolveWorkspaceId } from "../utils";

const generateUniqueWorkspaceSlug = async (
  databases: Databases,
  baseSlug: string
) => {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await databases.listDocuments<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      [Query.equal("slug", slug), Query.limit(1)]
    );

    if (existing.total === 0) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
};

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );
    return c.json({ data: workspaces });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const resolvedWorkspaceId = await resolveWorkspaceId(
      databases,
      workspaceId
    );

    const member = await getMember({
      databases,
      workspaceId: resolvedWorkspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      resolvedWorkspaceId
    );

    return c.json({ data: workspace });
  })
  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const resolvedWorkspaceId = await resolveWorkspaceId(
      databases,
      workspaceId
    );

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      resolvedWorkspaceId
    );

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
        slug: workspace.slug,
      },
    });
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const {
        name,
        description,
        image,
        purpose,
        workspaceType,
        teamSize,
        workflowStyle,
        mainGoal,
        workspaceStatus,
        capabilities,
        tools,
      } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // Com plano no Appwrite, descomente o código abaixo para obter a URL do arquivo enviado
        // const arrayBuffer = await storage.getFilePreview(
        //   IMAGES_BUCKET_ID,
        //   file.$id
        // );

        // uploadedImageUrl = `data:image/png;base64,${Buffer.from(
        //   arrayBuffer
        // ).toString("base64")}`;

        // const imageUrl = await storage.getFileView(IMAGES_BUCKET_ID, file.$id);
        // uploadedImageUrl = imageUrl.toString();

        uploadedImageUrl = file.$id;
      }

      const baseSlug = slugify(name) || "workspace";
      const slug = await generateUniqueWorkspaceSlug(databases, baseSlug);

      const payload: Record<string, unknown> = {
        name,
        userId: user.$id,
        inviteCode: generateInviteCode(6),
        slug,
      };

      if (typeof uploadedImageUrl !== "undefined") {
        payload.imageUrl = uploadedImageUrl;
      }
      if (typeof description !== "undefined") {
        payload.description = description;
      }
      if (typeof purpose !== "undefined") payload.purpose = purpose;
      if (typeof workspaceType !== "undefined") {
        payload.workspaceType = workspaceType;
      } else {
        payload.workspaceType = "software_dev";
      }
      if (typeof teamSize !== "undefined") payload.teamSize = teamSize;
      if (typeof workflowStyle !== "undefined") {
        payload.workflowStyle = workflowStyle;
      }
      if (typeof mainGoal !== "undefined") payload.mainGoal = mainGoal;
      if (typeof workspaceStatus !== "undefined") {
        payload.workspaceStatus = workspaceStatus;
      }
      const resolvedConfig = resolveWorkspaceConfig({
        workspaceType,
        tools,
        capabilities,
      });

      if (typeof resolvedConfig.capabilities !== "undefined") {
        payload.capabilities = resolvedConfig.capabilities;
      }
      if (typeof resolvedConfig.tools !== "undefined") {
        payload.tools = resolvedConfig.tools;
      }
      const agentProfileId = await resolveAgentProfileId({
        databases,
        slug: resolvedConfig.agentProfileSlug,
      });
      if (resolvedConfig.agentProfileSlug && !agentProfileId) {
        return c.json({ error: "Agent profile not found for workspace type" }, 400);
      }
      if (agentProfileId) {
        payload.agentProfileId = agentProfileId;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        ID.unique(),
        payload
      );

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({ data: workspace });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const {
        name,
        description,
        image,
        purpose,
        workspaceType,
        teamSize,
        workflowStyle,
        mainGoal,
        workspaceStatus,
        capabilities,
        tools,
      } = c.req.valid("form");

      const resolvedWorkspaceId = await resolveWorkspaceId(
        databases,
        workspaceId
      );

      const member = await getMember({
        databases,
        workspaceId: resolvedWorkspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );
        uploadedImageUrl = file.$id;
      } else {
        uploadedImageUrl = image;
      }

      const payload: Record<string, unknown> = {};
      if (typeof name !== "undefined") payload.name = name;
      if (typeof description !== "undefined") {
        payload.description = description;
      }
      if (typeof uploadedImageUrl !== "undefined") {
        payload.imageUrl = uploadedImageUrl;
      }
      if (typeof purpose !== "undefined") payload.purpose = purpose;
      if (typeof workspaceType !== "undefined") {
        payload.workspaceType = workspaceType;
      }
      if (typeof teamSize !== "undefined") payload.teamSize = teamSize;
      if (typeof workflowStyle !== "undefined") {
        payload.workflowStyle = workflowStyle;
      }
      if (typeof mainGoal !== "undefined") payload.mainGoal = mainGoal;
      if (typeof workspaceStatus !== "undefined") {
        payload.workspaceStatus = workspaceStatus;
      }
      const resolvedConfig = resolveWorkspaceConfig({
        workspaceType,
        tools,
        capabilities,
      });

      if (typeof resolvedConfig.capabilities !== "undefined") {
        payload.capabilities = resolvedConfig.capabilities;
      }
      if (typeof resolvedConfig.tools !== "undefined") {
        payload.tools = resolvedConfig.tools;
      }
      const agentProfileId = await resolveAgentProfileId({
        databases,
        slug: resolvedConfig.agentProfileSlug,
      });
      if (resolvedConfig.agentProfileSlug && !agentProfileId) {
        return c.json({ error: "Agent profile not found for workspace type" }, 400);
      }
      if (agentProfileId) {
        payload.agentProfileId = agentProfileId;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        resolvedWorkspaceId,
        payload
      );
      return c.json({ data: workspace });
    }
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const resolvedWorkspaceId = await resolveWorkspaceId(
      databases,
      workspaceId
    );

    const member = await getMember({
      databases,
      workspaceId: resolvedWorkspaceId,
      userId: user.$id,
    });
    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await databases.deleteDocument({
      databaseId: DATABASE_ID,
      collectionId: WORKSPACE_ID,
      documentId: resolvedWorkspaceId,
    });

    return c.json({ data: { $id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const resolvedWorkspaceId = await resolveWorkspaceId(
      databases,
      workspaceId
    );

    const member = await getMember({
      databases,
      workspaceId: resolvedWorkspaceId,
      userId: user.$id,
    });
    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const workspace = await databases.updateDocument({
      databaseId: DATABASE_ID,
      collectionId: WORKSPACE_ID,
      documentId: resolvedWorkspaceId,
      data: {
        inviteCode: generateInviteCode(6),
      },
    });

    return c.json({ data: workspace });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const resolvedWorkspaceId = await resolveWorkspaceId(
        databases,
        workspaceId
      );

      const member = await getMember({
        databases,
        workspaceId: resolvedWorkspaceId,
        userId: user.$id,
      });
      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        resolvedWorkspaceId
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId: resolvedWorkspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });

      return c.json({ data: workspace });
    }
  )
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const resolvedWorkspaceId = await resolveWorkspaceId(
      databases,
      workspaceId
    );

    const member = await getMember({
      databases,
      workspaceId: resolvedWorkspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskCountDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskCountDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    });
  });
  

export default app;
