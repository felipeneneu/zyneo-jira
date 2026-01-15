import { Query, type Databases } from "node-appwrite";

import { AGENT_PROFILES_ID, DATABASE_ID } from "@/src/config";

type ResolveAgentProfileIdInput = {
  databases: Databases;
  slug?: string | null;
};

export const resolveAgentProfileId = async ({
  databases,
  slug,
}: ResolveAgentProfileIdInput) => {
  if (!slug) return null;

  const profiles = await databases.listDocuments(DATABASE_ID, AGENT_PROFILES_ID, [
    Query.equal("slug", slug),
    Query.limit(1),
  ]);

  return profiles.documents[0]?.$id ?? null;
};
