import { createAdminClient, forceCleanup } from "@/src/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/sign-up?error=missing_params`
      );
    }

    // CRÍTICO: Limpa sessões anteriores antes de criar nova
    await forceCleanup();

    const { account } = await createAdminClient();
    
    // Cria nova sessão
    const session = await account.createSession(userId, secret);

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

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
    
  } catch {
    // Cleanup de emergência
    await forceCleanup();
    
    return NextResponse.redirect(
      `${request.nextUrl.origin}/sign-up?error=callback_failed`
    );
  }
}
