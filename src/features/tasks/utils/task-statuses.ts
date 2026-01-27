import { TaskStatus } from "@/src/features/tasks/types";

const DEFAULT_STATUSES = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
] as const;

const DEV_GUIDED_STATUSES = [
  TaskStatus.BACKLOG,
  TaskStatus.READY,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
] as const;

export const getWorkspaceStatuses = (workspaceType?: string | null) => {
  if (workspaceType === "software_dev") {
    return DEV_GUIDED_STATUSES;
  }
  return DEFAULT_STATUSES;
};
