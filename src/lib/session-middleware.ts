import {
  Account,
  Client,
  Databases,
  Storage,
  type Account as AccountType,
  type Databases as DatabasesType,
  type Storage as StorageType,
  Models,
} from "node-appwrite";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AUTH_COOKIE } from "../features/auth/constants";

type AdditionalContext = {
  Variables: {
    account: AccountType;
    databases: DatabasesType;
    storage: StorageType;
    user: Models.User<Models.Preferences>;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    // Tenta cookie de email primeiro, depois OAuth
    const emailSession = getCookie(c, AUTH_COOKIE);
    const oauthSession = getCookie(c, `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`);
    
    const session = oauthSession ?? emailSession;

    if (session) {
      try {
        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);

        const user = await account.get();

        c.set("account", account);
        c.set("databases", databases);
        c.set("storage", storage);
        c.set("user", user);
        
        console.log("✅ Sessão válida para usuário:", user.email);
      } catch (err: any) {
        console.error("⚠️ Sessão inválida:", err.message);
        
        // Remove cookies inválidos
        const { deleteCookie } = await import("hono/cookie");
        deleteCookie(c, AUTH_COOKIE);
        deleteCookie(c, `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`);
      }
    }

    // Continua mesmo sem sessão (permite login/register)
    await next();
  }
);
