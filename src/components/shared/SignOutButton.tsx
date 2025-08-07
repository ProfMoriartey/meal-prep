"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut()}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Sign Out
    </Button>
  );
}
