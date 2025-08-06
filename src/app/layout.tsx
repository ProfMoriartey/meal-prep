// src/app/layout.tsx

import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { auth } from "~/server/auth";
import { SessionProvider } from "~/components/session-provider";
import Sidebar from "~/components/shared/Sidebar"; // Import the Sidebar component

export const metadata: Metadata = {
  title: "Planny",
  description: "Manage your meal prep and ingredients all in one place",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({ subsets: ["latin"] });

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Meal Planner" />
      </head>
      <body>
        {" "}
        <Sidebar session={session}>
          <SessionProvider session={session}>{children}</SessionProvider>
        </Sidebar>
      </body>
    </html>
  );
}
