import { ID, Query, type Databases } from "node-appwrite";

import {
  DATABASE_ID,
  MEMBERS_ID,
  NOTIFICATIONS_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACE_ID,
} from "@/src/config";
import type { Member } from "@/src/features/members/types";
import type { Task } from "@/src/features/tasks/types";
import { TaskStatus } from "@/src/features/tasks/types";
import { setFlagValue } from "@/src/features/tasks/utils/task-flags";
import { DEV_GUIDED_TUTORIAL_TASKS } from "@/src/features/tutorial/dev-guided-tutorial-config";
import { DEV_GUIDED_V1 } from "@/src/features/workspaces/presets/dev-guided-v1";
import type { Workspace } from "@/src/features/workspaces/types";

// Gera a chave do projeto (ex: "Development" -> "DEVEL")
const buildProjectKeyBase = (name: string) => {
  const letters = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const base = letters.slice(0, 5);
  if (base.length >= 3) {
    return base;
  }
  return (base + "XXX").slice(0, 3);
};

const buildThreadKey = (type: string, workspaceId: string, entityId: string) =>
  `${type}:${workspaceId}:task:${entityId}`;

export const setupDevGuidedWorkspace = async ({
  databases,
  workspaceId,
  userId,
}: {
  databases: Databases;
  workspaceId: string;
  userId: string;
}) => {
  // Verifica se o usuário é membro do workspace
  const members = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [Query.equal("workspaceId", workspaceId), Query.equal("userId", userId)],
  );

  const member = members.documents[0];
  if (!member) return;

  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACE_ID,
    workspaceId,
  );

  // Se já estiver no preset correto, não faz nada
  if (workspace.workflowPreset === DEV_GUIDED_V1.preset) {
    return;
  }

  // Se já existirem projetos, apenas atualiza o preset e sai
  const existingProjects = await databases.listDocuments(
    DATABASE_ID,
    PROJECTS_ID,
    [Query.equal("workspaceId", workspaceId), Query.limit(1)],
  );

  if (existingProjects.total > 0) {
    await databases.updateDocument(DATABASE_ID, WORKSPACE_ID, workspaceId, {
      workflowPreset: DEV_GUIDED_V1.preset,
    });
    return;
  }

  try {
    // Cria o projeto inicial de "Desenvolvimento"
    const project = await databases.createDocument(
      DATABASE_ID,
      PROJECTS_ID,
      ID.unique(),
      {
        name: "Desenvolvimento",
        workspaceId,
        projectKey: buildProjectKeyBase("Development"),
        taskSeq: 0,
      },
    );

    const now = new Date();
    const iso = (date: Date) => date.toISOString();

    // Datas fictícias para o tutorial
    const overdueDate = new Date(now);
    overdueDate.setDate(now.getDate() - 2); // 2 dias atrás

    const staleDate = new Date(now);
    staleDate.setDate(now.getDate() - 5); // 5 dias atrás

    const blockedDate = new Date(now);
    blockedDate.setDate(now.getDate() - 3); // 3 dias atrás

    const doneDate = new Date(now);
    doneDate.setDate(now.getDate() - 1);

    const baseFlags = setFlagValue([], "priority", "P2");
    const blockedFlags = setFlagValue(
      setFlagValue(baseFlags, "blocked", true),
      "blockedAt",
      iso(blockedDate),
    );

    // Payload de tarefas de exemplo
    const tasksPayload: Array<Record<string, unknown>> = [
      {
        name: DEV_GUIDED_TUTORIAL_TASKS.overdue,
        status: TaskStatus.IN_PROGRESS,
        workspaceId,
        projectId: project.$id,
        assigneeId: member.$id,
        position: 1000,
        dueDate: iso(overdueDate),
        flags: baseFlags,
        lastActivityAt: iso(overdueDate),
      },
      {
        name: DEV_GUIDED_TUTORIAL_TASKS.stale,
        status: TaskStatus.READY,
        workspaceId,
        projectId: project.$id,
        assigneeId: member.$id,
        position: 2000,
        dueDate: iso(now),
        flags: baseFlags,
        lastActivityAt: iso(staleDate),
      },
      {
        name: DEV_GUIDED_TUTORIAL_TASKS.blocked,
        status: TaskStatus.IN_PROGRESS,
        workspaceId,
        projectId: project.$id,
        assigneeId: member.$id,
        position: 3000,
        dueDate: iso(now),
        flags: blockedFlags,
        lastActivityAt: iso(blockedDate),
      },
      {
        name: DEV_GUIDED_TUTORIAL_TASKS.inReview,
        status: TaskStatus.IN_REVIEW,
        workspaceId,
        projectId: project.$id,
        assigneeId: member.$id,
        position: 4000,
        dueDate: iso(now),
        flags: baseFlags,
        lastActivityAt: iso(now),
      },
      {
        name: DEV_GUIDED_TUTORIAL_TASKS.done,
        status: TaskStatus.DONE,
        workspaceId,
        projectId: project.$id,
        assigneeId: member.$id,
        position: 5000,
        dueDate: iso(now),
        flags: baseFlags,
        lastActivityAt: iso(doneDate),
      },
    ];

    const createdTasks: Task[] = [];
    let nextSeq = project.taskSeq ?? 0;

    // Cria as tarefas uma por uma para gerar os IDs e chaves sequenciais
    for (const payload of tasksPayload) {
      nextSeq += 1;
      const taskKey = `${project.projectKey}-${nextSeq}`;
      const created = await databases.createDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          ...payload,
          taskKey,
        },
      );
      createdTasks.push(created);
    }

    // Atualiza o sequencial no projeto
    await databases.updateDocument(DATABASE_ID, PROJECTS_ID, project.$id, {
      taskSeq: nextSeq,
    });

    const [overdueTask, staleTask, blockedTask] = createdTasks;

    // Cria as notificações iniciais traduzidas
    await databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
      userId,
      workspaceId,
      type: "task.overdue",
      severity: "critical",
      title: "Tarefa atrasada",
      snippet: "Esta tarefa passou do prazo. Replaneje ou atualize.",
      entityType: "task",
      entityId: overdueTask.$id,
      threadKey: buildThreadKey("task.overdue", workspaceId, overdueTask.$id),
    });

    await databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
      userId,
      workspaceId,
      type: "task.stale",
      severity: "warn",
      title: "Tarefa estagnada",
      snippet: `Sem atividade há ${DEV_GUIDED_V1.aging.staleDays} dias. Considere atualizar.`,
      entityType: "task",
      entityId: staleTask.$id,
      threadKey: buildThreadKey("task.stale", workspaceId, staleTask.$id),
    });

    await databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
      userId,
      workspaceId,
      type: "task.blocked",
      severity: "critical",
      title: "Tarefa bloqueada",
      snippet: `Tarefa bloqueada há ${DEV_GUIDED_V1.aging.blockedDays} dias. Escale ou desbloqueie.`,
      entityType: "task",
      entityId: blockedTask.$id,
      threadKey: buildThreadKey("task.blocked", workspaceId, blockedTask.$id),
    });

    // Finaliza configurando o preset no Workspace
    await databases.updateDocument(DATABASE_ID, WORKSPACE_ID, workspaceId, {
      workflowPreset: DEV_GUIDED_V1.preset,
    });
  } catch (error: any) {
    // Tratamento de erro caso o documento já exista (evita crash em requisições paralelas)
    if (error?.code === 409 || error?.type === "document_already_exists") {
      await databases.updateDocument(DATABASE_ID, WORKSPACE_ID, workspaceId, {
        workflowPreset: DEV_GUIDED_V1.preset,
      });
      return;
    }
    throw error;
  }
};
