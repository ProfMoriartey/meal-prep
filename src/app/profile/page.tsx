"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "~/components/ui/button"; // Assuming this is your shadcn/ui button
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"; // Assuming this is your shadcn/ui card
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Show a loading state while the session is being checked.
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  // If the user is not authenticated, display a sign-in button.
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-3xl font-bold">You are not signed in.</h1>
        <Button onClick={() => signIn()} className="px-6 py-3">
          Sign In
        </Button>
      </div>
    );
  }

  // If the user is authenticated, display their profile information.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {session?.user?.image && (
            <div className="mb-4 flex justify-center">
              <Image
                src={session.user.image}
                alt="User Profile"
                width={96}
                height={96}
                className="rounded-full border-2 border-indigo-500"
              />
            </div>
          )}
          <CardTitle className="text-2xl">
            {session?.user?.name ?? "User"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {session?.user?.email ?? "No email provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
