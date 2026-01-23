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

import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
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
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !projectId) {
      await next();
      return;
    }

    const client = new Client().setEndpoint(endpoint).setProject(projectId);

    const session = resolveSessionCookie(c, projectId);

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
      } catch {
        deleteCookie(c, AUTH_COOKIE);
        deleteCookie(c, `a_session_${projectId}`);
      }
    }

    // Continua mesmo sem sessão (permite login/register)
    await next();
  }
);

const resolveSessionCookie = (c: Context, projectId: string) => {
  const emailSession = getCookie(c, AUTH_COOKIE);
  const oauthSession = getCookie(c, `a_session_${projectId}`);
  return oauthSession ?? emailSession ?? null;
};
