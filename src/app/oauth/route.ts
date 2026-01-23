import { createAdminClient, forceCleanup } from "@/src/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    console.log("[OAuth Route] Iniciando callback...", { userId: userId?.substring(0, 5), hasSecret: !!secret });

    if (!userId || !secret) {
      console.error("[OAuth Route] Erro: userId ou secret faltando.");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/sign-up?error=missing_params`
      );
    }

    // CRÍTICO: Limpa sessões anteriores antes de criar nova
    console.log("[OAuth Route] Limpando sessões anteriores...");
    await forceCleanup();

    console.log("[OAuth Route] Criando Admin Client...");
    const { account } = await createAdminClient();

    // Cria nova sessão
    console.log("[OAuth Route] Criando sessão no Appwrite...");
    try {
      const session = await account.createSession(userId, secret);
      console.log("[OAuth Route] Sessão criada com sucesso. ID:", session.$id);

      // Salva no cookie (usa o cookie OAuth padrão do Appwrite)
      const cookieStore = await cookies();
      const oauthCookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

      console.log("[OAuth Route] Configurando cookie:", oauthCookieName);
      cookieStore.set(oauthCookieName, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      });

      console.log("[OAuth Route] Redirecionando para home...");
      return NextResponse.redirect(`${request.nextUrl.origin}/`);
    } catch (sessionError) {
      console.error("[OAuth Route] Erro ao criar sessão no Appwrite:", sessionError);
      throw sessionError; // Re-throw para cair no catch externo e fazer cleanup
    }

  } catch (error: any) {
    console.error("[OAuth Route] Erro fatal no callback OAuth:", error);

    // Log stack trace se disponível
    if (error?.stack) {
      console.error("[OAuth Route] Stack:", error.stack);
    }

    // Cleanup de emergência
    await forceCleanup();

    return NextResponse.redirect(
      `${request.nextUrl.origin}/sign-up?error=callback_failed`
    );
  }
}
