import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient, forceCleanup } from "@/src/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/src/lib/session-middleware";

const app = new Hono()
  .get("/current", sessionMiddleware, (c) => {
    const user = c.get("user");
    return c.json({ data: user });
  })
  
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");
      
      console.log("🔐 Tentando login com email...");
      
      const { account } = await createAdminClient();
      const session = await account.createEmailPasswordSession(email, password);
      
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      console.log("✅ Login realizado com sucesso");
      return c.json({ success: true });
      
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      return c.json({ error: error.message }, 401);
    }
  })
  
  .post("/register", zValidator("json", registerSchema), async (c) => {
    try {
      const { name, email, password } = c.req.valid("json");

      console.log("📝 Registrando novo usuário...");

      const { account } = await createAdminClient();
      await account.create(ID.unique(), email, password, name);

      const session = await account.createEmailPasswordSession(email, password);

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
      
      console.log("✅ Registro realizado com sucesso");
      return c.json({ success: true });
      
    } catch (error: any) {
      console.error("❌ Erro no registro:", error);
      return c.json({ error: error.message }, 400);
    }
  })
  
  .post("/sync-profile", sessionMiddleware, async (c) => {
    const account = c.get("account");
    const user = c.get("user");

    const identities = await account.listIdentities();
    const identity = identities.identities?.[0];

    if (!identity?.providerAccessToken) {
      return c.json({ 
        data: { 
          avatarUrl: (user.prefs as Record<string, string>).avatarUrl ?? null 
        } 
      });
    }

    let avatarUrl: string | null = null;

    try {
      if (identity.provider === "google") {
        const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: {
            Authorization: `Bearer ${identity.providerAccessToken}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          avatarUrl = json.picture ?? null;
        }
      } else if (identity.provider === "github") {
        const res = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${identity.providerAccessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "zyneolist",
          },
        });
        if (res.ok) {
          const json = await res.json();
          avatarUrl = json.avatar_url ?? null;
        }
      }
    } catch (err) {
      console.error("❌ Erro ao buscar avatar:", err);
    }

    if (!avatarUrl) {
      return c.json({ 
        data: { 
          avatarUrl: (user.prefs as Record<string, string>).avatarUrl ?? null 
        } 
      });
    }

    const nextPrefs = { ...(user.prefs as Record<string, string>), avatarUrl };
    await account.updatePrefs(nextPrefs);

    return c.json({ data: { avatarUrl } });
  })

  .post("/logout", sessionMiddleware, async (c) => {
    try {
      const account = c.get("account");
      
      console.log("🚪 Realizando logout...");
      
      // Remove cookies
      deleteCookie(c, AUTH_COOKIE);
      deleteCookie(c, `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`);

      // Deleta sessão no Appwrite
      try {
        await account.deleteSession("current");
      } catch (err) {
        console.warn("⚠️ Erro ao deletar sessão (pode já estar expirada):", err);
      }

      console.log("✅ Logout realizado");
      return c.json({ success: true });
      
    } catch (error: any) {
      console.error("❌ Erro no logout:", error);
      
      // Mesmo com erro, remove os cookies
      deleteCookie(c, AUTH_COOKIE);
      deleteCookie(c, `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`);
      
      return c.json({ success: true });
    }
  });

export default app;
