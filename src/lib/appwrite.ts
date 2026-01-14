import { Client, Account, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../features/auth/constants";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  // Pega os cookies existentes
  const cookieStore = await cookies();
  const emailSession = cookieStore.get(AUTH_COOKIE)?.value;
  const oauthSession = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`)?.value;

  // Declaração correta do session
  const session = oauthSession ?? emailSession;

  if (session) {
    client.setSession(session);
  } else {
    // Sem sessão, apenas retorna o client sem setSession
    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
    };
  }

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}
