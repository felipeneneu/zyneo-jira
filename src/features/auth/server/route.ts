import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/src/lib/appwrite";
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
    const { email, password } = c.req.valid("json");
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return c.json({ success: true });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name);

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return c.json({ success: true });
  })
  .post("/sync-profile", sessionMiddleware, async (c) => {
    const account = c.get("account");
    const user = c.get("user");

    const identities = await account.listIdentities();
    const identity = identities.identities?.[0];

    if (!identity?.providerAccessToken) {
      return c.json({ data: { avatarUrl: (user.prefs as Record<string, string>).avatarUrl ?? null } });
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
    } catch {}

    if (!avatarUrl) {
      return c.json({ data: { avatarUrl: (user.prefs as Record<string, string>).avatarUrl ?? null } });
    }

    const nextPrefs = { ...(user.prefs as Record<string, string>), avatarUrl };
    await account.updatePrefs(nextPrefs);

    return c.json({ data: { avatarUrl } });
  })

  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");
    deleteCookie(c, AUTH_COOKIE);

    await account.deleteSession("current");

    return c.json({ success: true });
  });

export default app;
