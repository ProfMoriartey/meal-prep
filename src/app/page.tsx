"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { signIn } from "next-auth/react";
import { LogOut, UserRound } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-600 to-blue-700 p-6 text-white">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="text-zinc-200">Planny</span>
        </h1>
        <p className="max-w-2xl text-lg text-cyan-950 sm:text-xl lg:text-2xl">
          Your personal meal planner. Manage your meals, plan your week, and eat
          smarter with a simple, elegant app.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          {status === "loading" && (
            <p className="text-lg font-medium">Loading...</p>
          )}

          {status === "unauthenticated" && (
            <Button
              onClick={() => signIn()}
              className="transform px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
            >
              Start Planning
            </Button>
          )}

          {status === "authenticated" && (
            <>
              <Link href="/profile" passHref>
                <Button
                  className="transform px-8 py-6 text-lg font-semibold text-zinc-950 transition-all hover:scale-105"
                  variant="outline"
                >
                  <UserRound className="mr-2" size={20} />
                  Go to Profile
                </Button>
              </Link>
              <Button
                onClick={() => signOut()}
                className="transform px-8 py-6 text-lg font-semibold text-zinc-950 transition-all hover:scale-105"
                variant="outline"
              >
                <LogOut className="mr-2" size={20} />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
