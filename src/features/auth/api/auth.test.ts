import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/src/app/oauth/route";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock("@/src/lib/appwrite", () => ({
  createAdminClient: vi.fn(),
  forceCleanup: vi.fn(),
}));

// Mock NextRequest and NextResponse
const mockRequest = (url: string): NextRequest =>
  ({
    nextUrl: new URL(url),
  } as NextRequest);

describe("OAuth Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT = "test-project";
  });

  it("should redirect to sign-up if userId or secret is missing", async () => {
    const req = mockRequest("http://localhost/oauth?userId=&secret=");
    const response = await GET(req);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-up?error=missing_params");
  });

  it("should redirect to home on successful session creation", async () => {
    const { createAdminClient } = await import("@/src/lib/appwrite");
    const { cookies } = await import("next/headers");

    const mockCreateSession = vi.fn().mockResolvedValue({ secret: "test-secret" });
    const mockSetCookie = vi.fn();

    vi.mocked(createAdminClient).mockReturnValue({
      account: { createSession: mockCreateSession },
    });

    vi.mocked(cookies).mockResolvedValue({
      set: mockSetCookie,
    });

    const req = mockRequest(
      "http://localhost/oauth?userId=user123&secret=secret123"
    );
    const response = await GET(req);

    expect(mockCreateSession).toHaveBeenCalledWith("user123", "secret123");
    expect(mockSetCookie).toHaveBeenCalledWith(
      "a_session_test-project",
      "test-secret",
      expect.any(Object)
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("should redirect to sign-up on session creation failure", async () => {
    const { createAdminClient } = await import("@/src/lib/appwrite");

    vi.mocked(createAdminClient).mockReturnValue({
      account: {
        createSession: vi.fn().mockRejectedValue(new Error("Appwrite Error")),
      },
    });

    const req = mockRequest(
      "http://localhost/oauth?userId=user123&secret=invalid"
    );
    const response = await GET(req);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/sign-up?error=callback_failed"
    );
  });
});
