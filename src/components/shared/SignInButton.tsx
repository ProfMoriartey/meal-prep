"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

export default function SignInButton() {
  return (
    <Button
      onClick={() => signIn()}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Sign In
    </Button>
  );
}
