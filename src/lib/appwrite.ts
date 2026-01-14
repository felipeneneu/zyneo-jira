import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../features/auth/constants";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const cookieStore = await cookies();
  const emailSession = cookieStore.get(AUTH_COOKIE)?.value;
  const oauthSession = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`)?.value;

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
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

// NOVA FUNÇÃO: Limpa todas as sessões
export async function forceCleanup() {
  try {
    const cookieStore = await cookies();
    
    // Remove cookie de email
    cookieStore.delete(AUTH_COOKIE);
    
    // Remove cookie OAuth
    const oauthCookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
    cookieStore.delete(oauthCookie);
    
    // Tenta deletar sessão no Appwrite
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch {
      // Ignora se não houver sessão
    }
    
    console.log("✅ Cleanup completo");
  } catch (error) {
    console.error("❌ Erro no cleanup:", error);
  }
}
