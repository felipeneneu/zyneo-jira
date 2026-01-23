"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient, forceCleanup } from "./appwrite"; // ajuste o path se necessário

const resolveOrigin = async () => {
  const h = await headers();

  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  return `${protocol}://${host}`;
};

/*
export async function signUpWithGoogle() {
  await forceCleanup();

  const { account } = await createAdminClient();
  const origin = await resolveOrigin();

  const nonce = Date.now().toString();
  const successUrl = `${origin}/oauth?nonce=${nonce}`;
  const failureUrl = `${origin}/sign-in?error=oauth_failed`;

  // ⚠️ NÃO use redirect()
  const url = account.createOAuth2Session(
    OAuthProvider.Google,
    successUrl,
    failureUrl
  );

    redirect(url);
}
*/

export async function signUpWithGoogle() {
  const origin = "https://zyneolist.vercel.app"; // ou resolveOrigin()
  const clientId = process.env.APPWRITE_CLIENT_ID_GOOGLE;
  
  const successUrl = `${origin}/oauth`;
  const failureUrl = `${origin}/sign-in?error=oauth_failed`;

  const url = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=693f71e20030f45a228c`;

  redirect(url);
}

// Faça o mesmo para GitHub (copie e mude o provider)
export async function signUpWithGithub() {
  try {
    await forceCleanup();

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
    console.error("GitHub OAuth error:", error);

    const origin = await resolveOrigin().catch(() => "http://localhost:3000");
    const errorUrl = `${origin}/sign-in?error=oauth_failed&message=${encodeURIComponent(
      error instanceof Error ? error.message : "Falha desconhecida"
    )}`;

    return redirect(errorUrl);
  }
}
