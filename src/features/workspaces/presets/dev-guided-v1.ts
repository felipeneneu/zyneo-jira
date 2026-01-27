import { TaskStatus } from "@/src/features/tasks/types";

export const DEV_GUIDED_V1 = {
  preset: "DEV_GUIDED_V1",
  gates: {
    definitionOfReady: {
      requireAssignee: true,
      requirePriority: true,
    },
    definitionOfDone: {
      requireFinalUpdate: false,
    },
  },
  aging: {
    staleDays: 3,
    blockedDays: 2,
  },
  allowedTransitions: {
    [TaskStatus.BACKLOG]: [TaskStatus.READY],
    [TaskStatus.READY]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.READY],
    [TaskStatus.IN_REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
    [TaskStatus.DONE]: [],
  },
} as const;
