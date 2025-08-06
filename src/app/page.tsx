// src/app/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth"; // Still need auth to check login status
import { signIn, signOut } from "next-auth/react"; // For the sign-in button

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Meal <span className="text-[hsl(280,100%,70%)]">Planner</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {session?.user ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-2xl text-white">
                Welcome back, {session.user.name ?? session.user.email}!
              </p>
              {/* Navigation links can go here or rely on the sidebar */}
              <div className="flex gap-4">
                <Link href="/plan" passHref>
                  <Button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                    Go to Plan
                  </Button>
                </Link>
                <Link href="/meals" passHref>
                  <Button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                    Go to Meals
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-2xl text-white">
                Sign in to start planning your meals!
              </p>
              <Button
                onClick={() => signIn()}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
