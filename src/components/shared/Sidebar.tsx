// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import UserDropdown from "~/components/shared/UserDropdown";
import { type Session } from "next-auth";
import { Button } from "~/components/ui/button";

interface SidebarProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function Sidebar({ children, session }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {" "}
      {/* Main container for the whole app */}
      {/* Mobile Overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      {/* Sidebar - fixed on mobile, takes space on desktop */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform bg-gray-900 text-white transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:flex-shrink-0 md:translate-x-0", // On desktop, it's relative and doesn't shrink
        )}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold">Meal Planner</h2>
        </div>
        <nav className="mt-8">
          <Link href="/plan" passHref>
            <div
              className="block px-6 py-2 transition-colors duration-200 hover:bg-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              View Plan
            </div>
          </Link>
          <Link href="/plan/create" passHref>
            <div
              className="block px-6 py-2 transition-colors duration-200 hover:bg-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              Create Plan
            </div>
          </Link>
          <Link href="/meals" passHref>
            <div
              className="block px-6 py-2 transition-colors duration-200 hover:bg-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              View Meals
            </div>
          </Link>
          <Link href="/meals/create" passHref>
            <div
              className="block px-6 py-2 transition-colors duration-200 hover:bg-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              Create Meal
            </div>
          </Link>
        </nav>
      </aside>
      {/* Main content area wrapper */}
      <div className="flex flex-1 flex-col">
        {" "}
        {/* This div takes remaining horizontal space and is a column for its children */}
        {/* Header - always visible */}
        <header className="flex items-center justify-between bg-gray-900 p-4 text-white shadow-md">
          {/* Hamburger Icon (only on mobile) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* App Title - always visible on desktop, adjusted margin for mobile */}
          <h1 className="ml-4 text-xl font-bold md:ml-0">Meal Planner</h1>

          {/* User Dropdown / Sign In Button - always visible */}
          <div className="ml-auto">
            {session?.user ? (
              <UserDropdown user={session.user} />
            ) : (
              <Link href="/api/auth/signin" passHref>
                <Button variant="ghost" className="text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </header>
        {/* Main content area for the page children */}
        <main className="flex-1 overflow-auto">
          {" "}
          {/* flex-1 to fill remaining vertical space, overflow-auto for scrolling */}
          {children}
        </main>
      </div>
    </div>
  );
}
