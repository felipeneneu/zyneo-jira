import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID, TASKS_ID, WORKSPACE_ID } from "@/src/config";
import type { Task } from "@/src/features/tasks/types";
import { TaskStatus } from "@/src/features/tasks/types";
import type { Workspace } from "@/src/features/workspaces/types";
import { DEV_GUIDED_V1 } from "@/src/features/workspaces/presets/dev-guided-v1";
import {
  getFlagValue,
  hasFlag,
  normalizeFlags,
} from "@/src/features/tasks/utils/task-flags";
import { upsertNotification } from "@/src/features/notifications/utils/upsert-notification";

const buildThreadKey = (type: string, workspaceId: string, entityId: string) =>
  `${type}:${workspaceId}:task:${entityId}`;

export const runDevGuidedRules = async ({
  databases,
  workspaceId,
}: {
  databases: Databases;
  workspaceId: string;
}) => {
  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACE_ID,
    workspaceId,
  );

  // Só executa as regras se o workspace for do tipo desenvolvimento de software
  if (workspace.workspaceType !== "software_dev") {
    return;
  }

  const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
    Query.equal("workspaceId", workspaceId),
    Query.limit(200),
  ]);

  const assigneeIds = tasks.documents.map((task) => task.assigneeId);
  const members = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_ID,
    assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
  );

  const memberById = new Map(
    members.documents.map((member) => [member.$id, member]),
  );

  const now = new Date();

  // Define os limites de tempo (aging) baseados nos presets
  const staleCutoff = new Date(now);
  staleCutoff.setDate(now.getDate() - DEV_GUIDED_V1.aging.staleDays);

  const blockedCutoff = new Date(now);
  blockedCutoff.setDate(now.getDate() - DEV_GUIDED_V1.aging.blockedDays);

  for (const task of tasks.documents) {
    // Ignora tarefas já concluídas
    if (task.status === TaskStatus.DONE) continue;

    const member = memberById.get(task.assigneeId);
    if (!member?.userId) continue;

    const flags = normalizeFlags(task.flags);

    // Lógica de verificação
    const isOverdue =
      task.dueDate && new Date(task.dueDate).getTime() < now.getTime();

    const isStale =
      task.lastActivityAt &&
      new Date(task.lastActivityAt).getTime() < staleCutoff.getTime();

    const blockedAt = getFlagValue(flags, "blockedAt");
    const isBlocked =
      hasFlag(flags, "blocked") &&
      blockedAt !== null &&
      new Date(blockedAt).getTime() < blockedCutoff.getTime();

    // 1. Notificação de Atraso
    if (isOverdue) {
      const taskLabel = task.taskKey ? `${task.taskKey} - ${task.name}` : task.name;
      await upsertNotification({
        databases,
        userId: member.userId,
        workspaceId,
        type: "task.overdue",
        severity: "critical",
        title: taskLabel,
        snippet:
          "Tarefa atrasada. Esta tarefa passou da data de entrega. Replaneje ou atualize-a.",
        entityType: "task",
        entityId: task.$id,
        threadKey: buildThreadKey("task.overdue", workspaceId, task.$id),
      });
    }

    // 2. Notificação de Inatividade (Stale)
    if (isStale) {
      const taskLabel = task.taskKey ? `${task.taskKey} - ${task.name}` : task.name;
      await upsertNotification({
        databases,
        userId: member.userId,
        workspaceId,
        type: "task.stale",
        severity: "warn",
        title: taskLabel,
        snippet: `Tarefa estagnada. Sem atividade há ${DEV_GUIDED_V1.aging.staleDays} dias. Considere atualizar o status.`,
        entityType: "task",
        entityId: task.$id,
        threadKey: buildThreadKey("task.stale", workspaceId, task.$id),
      });
    }

    // 3. Notificação de Bloqueio Prolongado
    if (isBlocked) {
      const taskLabel = task.taskKey ? `${task.taskKey} - ${task.name}` : task.name;
      await upsertNotification({
        databases,
        userId: member.userId,
        workspaceId,
        type: "task.blocked",
        severity: "critical",
        title: taskLabel,
        snippet: `Tarefa bloqueada. Bloqueada há ${DEV_GUIDED_V1.aging.blockedDays} dias. Escale o problema ou desbloqueie.`,
        entityType: "task",
        entityId: task.$id,
        threadKey: buildThreadKey("task.blocked", workspaceId, task.$id),
      });
    }
  }
};
