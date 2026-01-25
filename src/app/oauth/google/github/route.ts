import { createAdminClient } from "@/src/lib/appwrite";
import { OAuthProvider } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { account } = await createAdminClient();

        const origin = request.nextUrl.origin;
        const successUrl = `${origin}/oauth`;
        const failureUrl = `${origin}/sign-in?error=oauth_failed`;

        const redirectUrl = await account.createOAuth2Token(
            OAuthProvider.Github,
            successUrl,
            failureUrl
        );

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error("[OAuth GitHub API] Erro:", error);
        const origin = request.nextUrl.origin;
        return NextResponse.redirect(`${origin}/sign-in?error=oauth_init_failed`);
    }
}
