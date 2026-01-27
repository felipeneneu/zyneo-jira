import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

import { getMember } from "../../members/utils";
import { Project } from "../../projects/types";

import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, WORKSPACE_ID } from "@/src/config";
import { createAdminClient } from "@/src/lib/appwrite";
import { sessionMiddleware } from "@/src/lib/session-middleware";
import { resolveWorkspaceId } from "../../workspaces/utils";

import { Task, TaskStatus } from "../types";
import { createTaskSchema } from "../schemas";
import { checkRulesForWorkspace } from "../utils/check-rules";
import type { Workspace } from "../../workspaces/types";
import { DEV_GUIDED_V1 } from "../../workspaces/presets/dev-guided-v1";
import {
  getPriority,
  normalizeFlags,
  setFlagValue,
} from "../utils/task-flags";

const buildProjectKeyBase = (name: string) => {
  const letters = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const base = letters.slice(0, 5);
  if (base.length >= 3) {
    return base;
  }
  return (base + "XXX").slice(0, 3);
};

const app = new Hono()
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

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

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: taskId } });
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId, projectId, assigneeId, status, search, dueDate } =
        c.req.valid("query");

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

      // Best-effort: keep list responsive even if rule checks fail.
      try {
        await checkRulesForWorkspace(databases, resolvedWorkspaceId);
      } catch {}

      const query = [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (assigneeId) {
        query.push(Query.equal("assigneeId", assigneeId));
      }

      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate));
      }

      if (search) {
        query.push(Query.search("name", search));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name,
            email: user.email,
            avatarUrl:
              (user.prefs as Record<string, string>)?.avatarUrl ?? null,
          };
        })
      );

      const populatedTasks: Task[] = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = await c.get("user");
      const databases = await c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        priority,
        flags,
        description,
        documentation,
        diagramUrl,
        githubPrs,
        completedAt,
      } = c.req.valid("json");

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

      const resolvedAssigneeId = assigneeId ?? member.$id;

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", resolvedWorkspaceId),
          Query.orderDesc("position"),
          Query.limit(1),
        ]
      );
      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const baseFlags = normalizeFlags(flags);
      const flagsWithPriority = priority
        ? setFlagValue(baseFlags, "priority", priority)
        : baseFlags;

      let createdTask: Task | null = null;
      let attempts = 0;

      while (!createdTask && attempts < 3) {
        attempts += 1;
        const project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );

        const projectKey =
          project.projectKey ?? buildProjectKeyBase(project.name);
        const nextSeq = (project.taskSeq ?? 0) + 1;
        const taskKey = `${projectKey}-${nextSeq}`;

        try {
          await databases.updateDocument(DATABASE_ID, PROJECTS_ID, projectId, {
            taskSeq: nextSeq,
            ...(project.projectKey ? {} : { projectKey }),
          });
        } catch {}

        try {
          createdTask = await databases.createDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            ID.unique(),
            {
              name,
              status,
              workspaceId: resolvedWorkspaceId,
              projectId,
              dueDate:
                dueDate instanceof Date ? dueDate.toISOString() : dueDate,
              assigneeId: resolvedAssigneeId,
              position: newPosition,
              description,
              documentation,
              diagramUrl,
              githubPrs,
              taskKey,
              flags: flagsWithPriority.length > 0 ? flagsWithPriority : undefined,
              lastActivityAt: new Date().toISOString(),
              completedAt:
                status === TaskStatus.DONE
                  ? completedAt instanceof Date
                    ? completedAt.toISOString()
                    : completedAt ?? new Date().toISOString()
                  : undefined,
            }
          );
        } catch (error) {
          if (attempts >= 3) {
            throw error;
          }
        }
      }

      if (!createdTask) {
        return c.json({ error: "Failed to create task" }, 500);
      }

      return c.json({ data: createdTask });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = await c.get("user");
      const databases = await c.get("databases");
      const {
        name,
        status,
        description,
        projectId,
        dueDate,
        assigneeId,
        priority,
        flags,
        documentation,
        diagramUrl,
        githubPrs,
        completedAt,
      } = c.req.valid("json");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        existingTask.workspaceId
      );

      const isDevGuided = workspace.workspaceType === "software_dev";
      const nextStatus = status ?? existingTask.status;
      const nextAssigneeId = assigneeId ?? existingTask.assigneeId;
      const baseFlags = normalizeFlags(flags ?? existingTask.flags);
      const nextFlags = priority
        ? setFlagValue(baseFlags, "priority", priority)
        : baseFlags;
      const nextPriority = getPriority(nextFlags);

      if (isDevGuided && status && status !== existingTask.status) {
        const fromStatus =
          existingTask.status === TaskStatus.TODO
            ? TaskStatus.BACKLOG
            : existingTask.status;
        const allowed = DEV_GUIDED_V1.allowedTransitions[fromStatus] ?? [];
        if (!allowed.includes(status)) {
          return c.json({ error: "Status transition not allowed" }, 400);
        }

        if (status === TaskStatus.READY) {
          if (!nextAssigneeId || !nextPriority) {
            return c.json(
              {
                error: "Task must have assignee and priority before entering Ready.",
              },
              400
            );
          }
        }

        if (status === TaskStatus.DONE) {
          if (!nextAssigneeId) {
            return c.json({ error: "Task must have assignee to finish." }, 400);
          }
        }
      }

      const hasMeaningfulChange =
        (typeof status !== "undefined" && status !== existingTask.status) ||
        (typeof assigneeId !== "undefined" &&
          assigneeId !== existingTask.assigneeId) ||
        (typeof description !== "undefined" &&
          description !== existingTask.description) ||
        (typeof documentation !== "undefined" &&
          documentation !== existingTask.documentation) ||
        (typeof diagramUrl !== "undefined" &&
          diagramUrl !== existingTask.diagramUrl) ||
        (typeof dueDate !== "undefined" &&
          (dueDate instanceof Date ? dueDate.toISOString() : dueDate) !==
            existingTask.dueDate) ||
        (typeof priority !== "undefined" &&
          getPriority(existingTask.flags) !== priority) ||
        (typeof flags !== "undefined" &&
          JSON.stringify(normalizeFlags(existingTask.flags)) !==
            JSON.stringify(normalizeFlags(flags)));

      const payload: Record<string, unknown> = {
        name,
        status: nextStatus,
        projectId,
        dueDate: dueDate instanceof Date ? dueDate.toISOString() : dueDate,
        assigneeId: nextAssigneeId,
        description,
        documentation,
        diagramUrl,
        githubPrs,
        flags: nextFlags.length > 0 ? nextFlags : undefined,
        completedAt:
          nextStatus === TaskStatus.DONE
            ? completedAt instanceof Date
              ? completedAt.toISOString()
              : completedAt ?? new Date().toISOString()
            : undefined,
      };

      if (hasMeaningfulChange) {
        payload.lastActivityAt = new Date().toISOString();
      }

      const task = await databases.updateDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        payload
      );

      return c.json({ data: task });
    }
  )
  .post("/:taskId/ai-description", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "AI not configured" }, 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let projectName: string | undefined;
    try {
      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        task.projectId
      );
      projectName = project.name;
    } catch {}

    const prompt = `
You are Echo AI, a friendly and concise project management assistant.
- Be clear
- Be practical
- Avoid unnecessary verbosity
- Use bullet points

Gere uma descrição detalhada em pt-BR para a tarefa abaixo, em Markdown.
Inclua:
- Contexto
- Objetivo
- Checklist
- Critérios de aceite
- Riscos/Observações

Tarefa: ${task.name}
Projeto: ${projectName ?? "-"}
Status: ${task.status}
Prazo: ${task.dueDate ?? "-"}
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 4) retorna só a sugestão
    return c.json({ data: { text } });
  })
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    let task: Task | null = null;

    try {
      task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
    } catch {}

    if (!task) {
      const byKey = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [Query.equal("taskKey", taskId), Query.limit(1)]
      );
      task = byKey.documents[0] ?? null;
    }

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name,
      email: user.email,
      avatarUrl: (user.prefs as Record<string, string>)?.avatarUrl ?? null,
    };

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.enum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { tasks } = await c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            "$id",
            tasks.map((task) => task.$id)
          ),
        ]
      );

      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );

      if (workspaceIds.size !== 1) {
        return c.json({ error: "All tasks must belong to the same workspace" });
      }

      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: "Workspace not found" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );
      const isDevGuided = workspace.workspaceType === "software_dev";

      if (isDevGuided) {
        for (const task of tasks) {
          const existing = tasksToUpdate.documents.find(
            (doc) => doc.$id === task.$id
          );
          if (!existing) continue;

          if (task.status !== existing.status) {
            const fromStatus =
              existing.status === TaskStatus.TODO
                ? TaskStatus.BACKLOG
                : existing.status;
            const allowed = DEV_GUIDED_V1.allowedTransitions[fromStatus] ?? [];
            if (!allowed.includes(task.status)) {
              return c.json(
                { error: "Status transition not allowed" },
                400
              );
            }

            if (task.status === TaskStatus.READY) {
              const priority = getPriority(existing.flags);
              if (!existing.assigneeId || !priority) {
                return c.json(
                  {
                    error:
                      "Task must have assignee and priority before entering Ready.",
                  },
                  400
                );
              }
            }

            if (task.status === TaskStatus.DONE && !existing.assigneeId) {
              return c.json(
                { error: "Task must have assignee to finish." },
                400
              );
            }
          }
        }
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          const existing = tasksToUpdate.documents.find(
            (doc) => doc.$id === $id
          );
          const statusChanged = existing && existing.status !== status;
          const payload: Record<string, unknown> = { status, position };
          if (statusChanged) {
            payload.lastActivityAt = new Date().toISOString();
          }
          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, payload);
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;
