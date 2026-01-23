"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient, forceCleanup } from "./appwrite"; // ajuste o path se necessário

const resolveOrigin = async () => {
  const originHeader = (await headers()).get("origin");
  
  // Fallback importante para produção e testes locais
  if (!originHeader) {
    // Em Vercel, use o domínio do projeto se origin não estiver presente
    const host = (await headers()).get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${host}`;
  }

  return originHeader;
};

export async function signUpWithGoogle() {
  try {
    // Limpa sessões antigas (muito bom ter isso!)
    await forceCleanup();

    const { account } = await createAdminClient();
    const origin = await resolveOrigin();

    const nonce = Date.now().toString(); // string para evitar problemas em query params
    const successUrl = `${origin}/oauth?nonce=${nonce}`;
    const failureUrl = `${origin}/sign-in?error=oauth_failed`; // ← use /sign-in aqui, já que é login

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      successUrl,
      failureUrl
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth error:", error); // ← log útil no Vercel

    const origin = await resolveOrigin().catch(() => "http://localhost:3000");
    const errorUrl = `${origin}/sign-in?error=oauth_failed&message=${encodeURIComponent(
      error instanceof Error ? error.message : "Falha desconhecida"
    )}`;

    return redirect(errorUrl);
  }
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
