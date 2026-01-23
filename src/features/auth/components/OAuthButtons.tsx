// src/components/OAuthButtons.tsx
'use server'
import { signUpWithGoogle, signUpWithGithub } from "@/src/lib/oauth";

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-y-4">
      <form action={signUpWithGoogle}>
        <Button variant="secondary" size="lg" className="w-full">
          <FcGoogle className="mr-2 size-5" />
          Login com Google
        </Button>
      </form>
      <form action={signUpWithGithub}>
        <Button variant="secondary" size="lg" className="w-full">
          <FaGithub className="mr-2 size-5" />
          Login com Github
        </Button>
      </form>
    </div>
  );
}
