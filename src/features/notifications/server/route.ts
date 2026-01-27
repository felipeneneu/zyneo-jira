import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { sessionMiddleware } from "@/src/lib/session-middleware";
import {
  DATABASE_ID,
  NOTIFICATIONS_ID,
  PROJECTS_ID,
  TASKS_ID,
} from "@/src/config";
import { resolveWorkspaceId } from "@/src/features/workspaces/utils";
import { getMember } from "@/src/features/members/utils";
import type { Task } from "@/src/features/tasks/types";
import { TaskStatus } from "@/src/features/tasks/types";
import type { Project } from "@/src/features/projects/types";

import { listNotificationsQuerySchema } from "../schemas";
import type { Notification } from "../types";
import { runDevGuidedRules } from "./rules/dev-guided-rules";

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildTaskLine = (task: Task, projectName?: string) => {
  const due = task.dueDate ? task.dueDate.slice(0, 10) : "Sem prazo";
  const flags = (task.flags ?? []).join(", ") || "nenhuma";
  const label = task.taskKey ? `${task.taskKey} - ${task.name}` : task.name;
  return `- ${label} | ${task.status} | prazo: ${due} | projeto: ${
    projectName ?? "-"
  } | flags: ${flags}`;
};

const buildDailyFocusPrompt = (params: {
  dateKey: string;
  total: number;
  statusCounts: Record<string, number>;
  wipCount: number;
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  noDueDateCount: number;
  blockedCount: number;
  staleCount: number;
  tasksSample: string[];
  focusCandidates: string[];
}) => {
  const {
    dateKey,
    total,
    statusCounts,
    wipCount,
    overdueCount,
    dueTodayCount,
    dueSoonCount,
    noDueDateCount,
    blockedCount,
    staleCount,
    tasksSample,
    focusCandidates,
  } = params;

  return `
Voce e o Echo AI, um companheiro bem-humorado guiando ao maximo de produtividade.
Responda em pt-BR.
CRITICO: A resposta DEVE ser um JSON valido minifyado (sem quebras de linha desnecessarias apos chaves), sem markdown formatting (\`\`\`json ... \`\`\`), apenas o raw string JSON.

Schema do JSON:
{
  "summary": "Resumo executivo em 1 paragrafo curto e engajante.",
  "risks": ["Risco 1", "Risco 2"], // Max 3 itens. Se vazio, array vazio [].
  "todayFocus": {
    "title": "Titulo do foco principal",
    "description": "Explicação rapida por que este é o foco."
  },
  "pending": ["Pendente 1", "Pendente 2"], // Max 4 itens. Priorize itens bloqueados ou 'stale'.
  "trend": "Tendencia observada (ex: 'Céu de brigadeiro', 'Tempestade à vista'). Frase curta.",
  "humor": "Uma frase engraçada curta sobre o estado atual do trabalho."
}

Dados do dia (${dateKey}):
- Total: ${total}
- Status: BACKLOG ${statusCounts.BACKLOG ?? 0}, TODO ${
    statusCounts.TODO ?? 0
  }, DOING ${wipCount}, DONE ${statusCounts.DONE ?? 0}
- Atrasadas: ${overdueCount}
- Vencem hoje: ${dueTodayCount}
- Bloqueadas: ${blockedCount}
- Paradas (stale): ${staleCount}

Tarefas:
${tasksSample.length > 0 ? tasksSample.join("\n") : "- Nenhuma"}

Foco sugerido:
${focusCandidates.length > 0 ? focusCandidates.join("\n") : "- Nenhuma"}
`;
};

const buildFallbackFocusJson = (params: {
  total: number;
  wipCount: number;
  overdueCount: number;
  blockedCount: number;
  staleCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  noDueDateCount: number;
  focusCandidates: string[];
}) => {
  const {
    total,
    wipCount,
    overdueCount,
    blockedCount,
    staleCount,
    dueTodayCount,
    dueSoonCount,
    noDueDateCount,
    focusCandidates,
  } = params;

  const risks: string[] = [];
  if (overdueCount > 0) risks.push(`${overdueCount} tarefa(s) atrasada(s)`);
  if (blockedCount > 0) risks.push(`${blockedCount} tarefa(s) bloqueada(s)`);
  if (staleCount > 0) risks.push(`${staleCount} tarefa(s) parada(s)`);

  const focusTitle = focusCandidates[0]
    ? focusCandidates[0].replace(/^-\s*/, "")
    : "Revisar prioridades do dia";

  const pending: string[] = [];
  if (dueTodayCount > 0)
    pending.push(`${dueTodayCount} tarefa(s) vencem hoje`);
  if (noDueDateCount > 0)
    pending.push(`${noDueDateCount} tarefa(s) sem prazo`);

  const trendBits = [];
  if (dueSoonCount > 0)
    trendBits.push(`${dueSoonCount} tarefa(s) vencem nos próximos 3 dias`);
  if (wipCount > 0) trendBits.push(`${wipCount} em andamento`);

  return {
    fallback: true,
    summary: `Hoje voce tem ${total} tarefa(s) atribuida(s), com ${wipCount} em andamento e ${overdueCount} atrasada(s).`,
    risks: risks.slice(0, 3),
    todayFocus: {
      title: focusTitle,
      description:
        "Foque na tarefa mais proxima do prazo para reduzir risco.",
    },
    pending: pending.slice(0, 4),
    trend: trendBits.length > 0 ? trendBits.join(" e ") : "Fluxo estavel",
    humor: "IA indisponivel no momento, mas seu foco segue firme.",
  };
};

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
  // POST /api/notifications/daily-focus
  .post(
    "/daily-focus",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        workspaceId: z.string().min(1),
        force: z.boolean().optional(),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, force } = c.req.valid("json");

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

      try {
        await runDevGuidedRules({ databases, workspaceId: resolvedWorkspaceId });
      } catch {}

      const dateKey = getDateKey(new Date());
      const threadKey = `daily-focus:${resolvedWorkspaceId}:${dateKey}`;

      const existing = await databases.listDocuments<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("type", "system.daily_focus"),
          Query.equal("threadKey", threadKey),
          Query.isNull("archivedAt"),
          Query.limit(1),
        ]
      );

      if (existing.documents.length > 0 && !force) {
        return c.json({ data: { notification: existing.documents[0] } });
      }

      const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("workspaceId", resolvedWorkspaceId),
        Query.equal("assigneeId", member.$id),
        Query.limit(200),
      ]);

      const projectIds = tasks.documents.map((task) => task.projectId);
      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      if (projects.total === 0 || tasks.total < 3) {
        return c.json({ data: { notification: null } });
      }
      const projectById = new Map(
        projects.documents.map((project) => [project.$id, project])
      );

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const dueSoonLimit = new Date(todayStart);
      dueSoonLimit.setDate(todayStart.getDate() + 3);

      const statusCounts: Record<string, number> = {};
      let overdueCount = 0;
      let dueTodayCount = 0;
      let dueSoonCount = 0;
      let noDueDateCount = 0;
      let blockedCount = 0;
      let staleCount = 0;

      const openTasks = tasks.documents.filter(
        (task) => task.status !== TaskStatus.DONE
      );

      for (const task of tasks.documents) {
        statusCounts[task.status] = (statusCounts[task.status] ?? 0) + 1;

        const flags = task.flags ?? [];
        if (flags.includes("blocked")) blockedCount += 1;
        if (flags.includes("stale")) staleCount += 1;

        if (task.status !== TaskStatus.DONE && !task.dueDate) {
          noDueDateCount += 1;
          continue;
        }

        if (!task.dueDate) {
          continue;
        }

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (task.status !== TaskStatus.DONE && dueDate < todayStart) {
          overdueCount += 1;
        }

        if (
          task.status !== TaskStatus.DONE &&
          dueDate.getTime() === todayStart.getTime()
        ) {
          dueTodayCount += 1;
        }

        if (
          task.status !== TaskStatus.DONE &&
          dueDate > todayStart &&
          dueDate <= dueSoonLimit
        ) {
          dueSoonCount += 1;
        }
      }

      const wipCount =
        (statusCounts.IN_PROGRESS ?? 0) + (statusCounts.IN_REVIEW ?? 0);

      const tasksSample = tasks.documents
        .slice(0, 40)
        .map((task) =>
          buildTaskLine(task, projectById.get(task.projectId)?.name)
        );

      const focusCandidates = openTasks
        .sort((a, b) => {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aDue - bDue;
        })
        .slice(0, 3)
        .map((task) => buildTaskLine(task, projectById.get(task.projectId)?.name));

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return c.json({ error: "AI not configured" }, 500);
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = buildDailyFocusPrompt({
        dateKey,
        total: tasks.total,
        statusCounts,
        wipCount,
        overdueCount,
        dueTodayCount,
        dueSoonCount,
        noDueDateCount,
        blockedCount,
        staleCount,
        tasksSample,
        focusCandidates,
      });

      let text = "";
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });
        text = result.response.text().trim();
      } catch {
        text = JSON.stringify(
          buildFallbackFocusJson({
            total: tasks.total,
            wipCount,
            overdueCount,
            blockedCount,
            staleCount,
            dueTodayCount,
            dueSoonCount,
            noDueDateCount,
            focusCandidates,
          })
        );
      }
      
      // Sanitization to ensure we store valid JSON string
      let snippet = text;
      try {
        // Try to parse to validate, but store as string
        JSON.parse(text); 
      } catch {
        // Fallback to a valid JSON error message or keep raw text if it was just markdown wrapped
        if (text.startsWith("```json")) {
           snippet = text.replace(/```json\n?|\n?```/g, "");
        } else {
           // Ultimate fallback if AI fails completely to give JSON
           snippet = JSON.stringify(
             buildFallbackFocusJson({
               total: tasks.total,
               wipCount,
               overdueCount,
               blockedCount,
               staleCount,
               dueTodayCount,
               dueSoonCount,
               noDueDateCount,
               focusCandidates,
             })
           );
        }
      }
      
      // Double check length constraints
      if (snippet.length > 4000) {
        snippet = snippet.slice(0, 4000);
      }

      const { ID } = await import("node-appwrite");
      let notification: Notification;
      if (existing.documents.length > 0) {
        const doc = existing.documents[0];
        notification = await databases.updateDocument<Notification>(
          DATABASE_ID,
          NOTIFICATIONS_ID,
          doc.$id,
          {
            severity: "info",
            title: `Overview diario - ${new Date().toLocaleDateString("pt-BR")}`,
            snippet,
            readAt: undefined,
          }
        );
      } else {
        notification = await databases.createDocument<Notification>(
          DATABASE_ID,
          NOTIFICATIONS_ID,
          ID.unique(),
          {
            userId: user.$id,
            workspaceId: resolvedWorkspaceId,
            type: "system.daily_focus",
            severity: "info",
            title: `Overview diario - ${new Date().toLocaleDateString("pt-BR")}`,
            snippet,
            entityType: "workspace",
            entityId: resolvedWorkspaceId,
            threadKey,
          }
        );
      }

      return c.json({ data: { notification } });
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
  )
  // POST /api/notifications/:notificationId/remove
  .post(
    "/:notificationId/remove",
    sessionMiddleware,
    zValidator("param", z.object({ notificationId: z.string().min(1) })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { notificationId } = c.req.valid("param");

      const notification = await databases.getDocument<Notification>(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId
      );

      if (notification.userId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await databases.deleteDocument(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notificationId
      );

      return c.json({ data: { success: true } });
    }
  );

export default app;
