import { Models } from "node-appwrite";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  workspaceId: string;
  projectKey?: string;
  taskSeq?: number;
};
