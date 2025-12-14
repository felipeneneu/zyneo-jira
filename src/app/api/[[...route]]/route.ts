import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/src/features/auth/server/route";
// import users from "@/src/features/users/server/route";

const app = new Hono().basePath("/api");

const routes = app.route("/auth", auth);
// .route("/users", users)
export const GET = handle(app);

export type AppType = typeof routes;
