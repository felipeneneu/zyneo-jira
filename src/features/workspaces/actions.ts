"use server";

import { cookies } from "next/headers";
import { Databases, Client, Query, Account } from "node-appwrite";
import { AUTH_COOKIE } from "@/src/features/auth/constants";
import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/src/config";
import { getMember } from "@/src/features/members/utils";
import { Workspace } from "./types";

export const getWorkspace = async () => {
  try {
    const session = (await cookies()).get(AUTH_COOKIE);
    if (!session) return { documents: [], total: 0 };

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    client.setSession(session.value);
    const databases = new Databases(client);
    const account = new Account(client);
    const user = await account.get();

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );
    return workspaces;
  } catch {
    return { documents: [], total: 0 };
  }
};

interface GetWorkspaceByIdParams {
  workspaceId: string;
}

export const getWorkspaceById = async ({
  workspaceId,
}: GetWorkspaceByIdParams) => {
  try {
    const session = (await cookies()).get(AUTH_COOKIE);
    if (!session) return null;

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    client.setSession(session.value);
    const databases = new Databases(client);
    const account = new Account(client);
    const user = await account.get();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return null;
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );
    return workspace;
  } catch {
    return null;
  }
};
