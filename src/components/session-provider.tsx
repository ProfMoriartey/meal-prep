"use client";

import { SessionProvider as Provider } from "next-auth/react";
import { type Session } from "next-auth";

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <Provider session={session}>{children}</Provider>;
}
