import { Models } from "node-appwrite";
import { Project } from "../projects/types";
import { MemberRole } from "../members/types";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}
export type TaskAssignee = Models.Document & {
  name: string;
  email: string;
  // opcionalmente:
  userId?: string;
  role?: MemberRole;
  workspaceId?: string;
};

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  assigneeId: string;
  projectId: string;
  workspaceId: string;
  position: number;
  dueDate: string;
  taskKey?: string;
  description?: string;
  documentation?: string;
  commentsCount?: number;
  diagramUrl?: string;
  githubPrs?: string[];
  completedAt?: string;

  project?: Project;
  assignee?: TaskAssignee;
};
