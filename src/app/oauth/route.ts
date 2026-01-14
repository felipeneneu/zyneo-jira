import { AUTH_COOKIE } from "@/src/features/auth/constants";
import { createAdminClient, forceCleanup } from "@/src/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");
    const nonce = request.nextUrl.searchParams.get("nonce");

    console.log("📨 OAuth callback recebido:", {
      userId: userId?.substring(0, 8) + "...",
      hasSecret: !!secret,
      nonce,
    });

    if (!userId || !secret) {
      console.error("❌ Parâmetros OAuth ausentes");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/sign-up?error=missing_params`
      );
    }

    // CRÍTICO: Limpa sessões anteriores antes de criar nova
    await forceCleanup();
    console.log("🧹 Sessões anteriores limpas");

    const { account } = await createAdminClient();
    
    // Cria nova sessão
    console.log("🔄 Criando nova sessão...");
    const session = await account.createSession(userId, secret);
    
    console.log("✅ Sessão OAuth criada:", session.$id);

    // Salva no cookie (usa o cookie OAuth padrão do Appwrite)
    const cookieStore = await cookies();
    const oauthCookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
    
    cookieStore.set(oauthCookieName, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    console.log(`✅ Cookie ${oauthCookieName} salvo`);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ OAuth concluído em ${duration}ms`);

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
    
  } catch (error: any) {
    console.error("❌ Erro crítico no callback:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });

    // Cleanup de emergência
    await forceCleanup();
    
    return NextResponse.redirect(
      `${request.nextUrl.origin}/sign-up?error=callback_failed`
    );
  }
}
