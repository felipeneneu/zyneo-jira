"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient } from "./appwrite";

const resolveOrigin = async () => {
  try {
    const h = await headers();

    const origin = h.get("origin");
    if (origin) return origin;

    const host = h.get("host") ?? "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    return `${protocol}://${host}`;
  } catch (error) {
    // Em Next.js 16, headers() pode falhar em certos contextos
    console.error("[resolveOrigin] Erro ao obter headers:", error);
    // Fallback para produção
    if (process.env.NODE_ENV === "production") {
      return "https://zyneolist.vercel.app";
    }
    return "http://localhost:3000";
  }
};

export async function signUpWithGoogle(formData: FormData) {
  const origin = await resolveOrigin();

  const successUrl = `${origin}/oauth`;
  const failureUrl = `${origin}/sign-in?error=oauth_failed`;

  const url = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=693f71e20030f45a228c`;

  redirect(url);
}

export async function signUpWithGithub() {
  try {
    // REMOVIDO: await forceCleanup() - causava erro com cookies() no Next.js 16
    // A limpeza de sessão será feita no callback OAuth

    const { account } = await createAdminClient();
    const origin = await resolveOrigin();

    const nonce = Date.now().toString();
    const successUrl = `${origin}/oauth?nonce=${nonce}`;
    const failureUrl = `${origin}/sign-in?error=oauth_failed`;

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      successUrl,
      failureUrl
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("[signUpWithGithub] Erro:", error);

    const origin = await resolveOrigin();
    const errorUrl = `${origin}/sign-in?error=oauth_failed&message=${encodeURIComponent(
      error instanceof Error ? error.message : "Falha desconhecida"
    )}`;

    return redirect(errorUrl);
  }
}
