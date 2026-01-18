import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/appwrite";
import { OAuthProvider } from "node-appwrite";

export async function GET(request: NextRequest) {
  const providerParam = request.nextUrl.searchParams.get("provider");

  if (!providerParam) {
    return new NextResponse("Missing provider", { status: 400 });
  }

  const { account } = await createAdminClient();
  const origin = request.nextUrl.origin;
  
  try {
    let provider: OAuthProvider;

    switch (providerParam) {
      case "google":
        provider = OAuthProvider.Google;
        break;
      case "github":
        provider = OAuthProvider.Github;
        break;
      default:
        return new NextResponse("Invalid provider", { status: 400 });
    }

    const redirectUrl = await account.createOAuth2Token(
      provider,
      `${origin}/oauth`,
      `${origin}/sign-up`
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth Init Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
