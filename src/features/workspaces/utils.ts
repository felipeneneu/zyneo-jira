import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, WORKSPACE_ID } from "@/src/config";
import type { Workspace } from "./types";

export const resolveWorkspaceId = async (
  databases: Databases,
  workspaceIdOrSlug: string
) => {
  if (!workspaceIdOrSlug) {
    return workspaceIdOrSlug;
  }

  const bySlug = await databases.listDocuments<Workspace>(
    DATABASE_ID,
    WORKSPACE_ID,
    [Query.equal("slug", workspaceIdOrSlug), Query.limit(1)]
  );

  return bySlug.documents[0]?.$id ?? workspaceIdOrSlug;
};
