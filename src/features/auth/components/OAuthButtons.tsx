// src/components/OAuthButtons.tsx
'use client';

import { signUpWithGoogle, signUpWithGithub } from "@/src/lib/oauth";

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-y-4">
      <form action={signUpWithGoogle}>
        <button type="submit">Login com Google</button>
      </form>

      <form action={signUpWithGithub}>
        <button type="submit">Login com Github</button>
      </form>
    </div>
  );
}
