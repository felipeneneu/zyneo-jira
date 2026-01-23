import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../features/auth/constants";

export async function createSessionClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  
  if (!endpoint || !projectId) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);
  
  const cookieStore = await cookies();
  const emailSession = cookieStore.get(AUTH_COOKIE)?.value;
  const oauthSession = cookieStore.get(`a_session_${projectId}`)?.value; // ← CORRIGIDO!
  
  const session = oauthSession ?? emailSession;
  
  if (!session) {
    throw new Error("NO_SESSION");
  }
  
  client.setSession(session);
  
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const apiKey = process.env.NEXT_APPWRITE_KEY;
  
  if (!endpoint || !projectId || !apiKey) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

// Limpa todas as sessões
export async function forceCleanup() {
  try {
    const cookieStore = await cookies();
    
    // Remove cookie de email
    cookieStore.delete(AUTH_COOKIE);
    
    // Remove cookie OAuth
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const oauthCookie = projectId ? `a_session_${projectId}` : null;
    if (oauthCookie) {
      cookieStore.delete(oauthCookie);
    }
    
    // Tenta deletar sessão no Appwrite
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch {}
  } catch {}
}
