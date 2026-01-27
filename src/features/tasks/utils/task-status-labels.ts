import { TaskStatus } from "@/src/features/tasks/types";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "Backlog",
  [TaskStatus.READY]: "Pronto",
  [TaskStatus.TODO]: "A fazer",
  [TaskStatus.IN_PROGRESS]: "Em andamento",
  [TaskStatus.IN_REVIEW]: "Em revisão",
  [TaskStatus.DONE]: "Concluído",
};
