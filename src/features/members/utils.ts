import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/src/config";
import { resolveWorkspaceId } from "@/src/features/workspaces/utils";

interface GetMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  databases,
  workspaceId,
  userId,
}: GetMemberProps) => {
  const resolvedWorkspaceId = await resolveWorkspaceId(databases, workspaceId);

  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("workspaceId", resolvedWorkspaceId),
    Query.equal("userId", userId),
  ]);

  return members.documents[0];
};
