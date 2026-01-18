import { Models } from "node-appwrite";

export type CommentType = "comment" | "progress" | "blocked" | "decision";

export type TaskComment = Models.Document & {
  taskId: string;
  workspaceId: string;
  projectId?: string;
  authorId: string;
  type: CommentType;
  content: string;
  mentionedUserIds?: string[];
  // Populated fields
  authorName?: string;
  authorEmail?: string;
};
