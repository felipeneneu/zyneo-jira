import { AUTH_COOKIE } from "@/src/features/auth/constants";
import { createAdminClient } from "@/src/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
     // If missing fields, potentially redirect to login with error, 
     // but for now just returning 400 is "safer" than crashing, 
     // though user asked to handle empty states. 
     // Let's redirect to sign-in if possible, or just stay 400 but valid.
    return new NextResponse("Missing fields", { status: 400 });
  }

  const { account } = await createAdminClient();
  
  try {
    const session = await account.createSession(userId, secret);

    (await cookies()).set(AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("OAuth Session Creation Failed:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/sign-in`);
  }

  return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
