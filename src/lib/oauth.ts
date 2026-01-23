"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient, forceCleanup } from "./appwrite";

const resolveOrigin = async () => {
  const origin = (await headers()).get("origin");
  if (!origin) {
    throw new Error("MISSING_ORIGIN");
  }
  return origin;
};

export async function signUpWithGithub() {
  let redirectUrl: string;
  try {
    // CRÍTICO: Limpa sessões anteriores
    await forceCleanup();
    
    const { account } = await createAdminClient();
    const origin = await resolveOrigin();
    
    // Adiciona nonce para prevenir reuso
    const nonce = Date.now();
    redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      `${origin}/oauth?nonce=${nonce}`,
      `${origin}/sign-up?error=oauth_failed`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`OAuth failed: ${message}`); // ← CORRIGIDO: parênteses normais
  }
  return redirect(redirectUrl);
}

export async function signUpWithGoogle() {
  let redirectUrl: string;
  try {
    // CRÍTICO: Limpa sessões anteriores
    await forceCleanup();
    
    const { account } = await createAdminClient();
    const origin = await resolveOrigin();
    
    const nonce = Date.now();
    redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}/oauth?nonce=${nonce}`,
      `${origin}/sign-up?error=oauth_failed`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`OAuth failed: ${message}`); // ← CORRIGIDO: parênteses normais
  }
  return redirect(redirectUrl);
}
