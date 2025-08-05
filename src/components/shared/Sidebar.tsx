// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 h-full w-64 transform bg-gray-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
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
          {/* Meals link has been removed as per your request */}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 transition-all duration-300">
        {/* Top Navigation for mobile */}
        <header className="flex items-center justify-between bg-gray-900 p-4 text-white shadow-md md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {/* Hamburger Icon (SVG) */}
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
          <h1 className="text-xl font-bold">Meal Planner</h1>
          <div></div> {/* Spacer for alignment */}
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
