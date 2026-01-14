"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient, forceCleanup } from "./appwrite";

export async function signUpWithGithub() {
  try {
    // CRÍTICO: Limpa sessões anteriores
    await forceCleanup();
    
    const { account } = await createAdminClient();
    const origin = (await headers()).get("origin");
    
    // Adiciona nonce para prevenir reuso
    const nonce = Date.now();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      `${origin}/oauth?nonce=${nonce}`,
      `${origin}/sign-up?error=oauth_failed`
    );

    return redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Erro OAuth GitHub:", error);
    throw new Error(`OAuth failed: ${error.message}`);
  }
}

export async function signUpWithGoogle() {
  try {
    // CRÍTICO: Limpa sessões anteriores
    await forceCleanup();
    
    const { account } = await createAdminClient();
    const origin = (await headers()).get("origin");
    
    const nonce = Date.now();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}/oauth?nonce=${nonce}`,
      `${origin}/sign-up?error=oauth_failed`
    );

    return redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Erro OAuth Google:", error);
    throw new Error(`OAuth failed: ${error.message}`);
  }
}
