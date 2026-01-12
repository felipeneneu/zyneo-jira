import { Models } from "node-appwrite";

export type ChatMessage = Models.Document & {
  workspaceId: string;
  projectId?: string;
  userId: string;
  body: string;
  senderName: string;
  senderAvatarUrl?: string;
};
