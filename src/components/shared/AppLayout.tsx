"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Utensils,
  Calendar,
  PlusCircle,
  ListChecks,
  LogOut,
  type LucideIcon,
  UserRound,
  ShoppingBasket,
} from "lucide-react";
import React from "react";

// This is the new client component that handles the responsive layout.
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Define the types for the props of NavButton
  interface NavButtonProps {
    href: string;
    icon: LucideIcon;
    label: string;
  }

  // Helper component for the mobile navigation buttons
  const NavButton = ({ href, icon: Icon, label }: NavButtonProps) => {
    const isActive = pathname === href;
    const activeClasses = isActive ? "text-indigo-600" : "text-gray-500";

    return (
      <Link
        href={href}
        passHref
        className={`flex flex-col items-center justify-center rounded-xl p-2 transition-colors duration-200 ${activeClasses} hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
        <span className="mt-1 text-xs font-medium">{label}</span>
      </Link>
    );
  };

  // Helper component for the desktop sidebar links
  const SidebarLink = ({ href, icon: Icon, label }: NavButtonProps) => {
    const isActive = pathname === href;
    const activeClasses = isActive
      ? "bg-gray-100 font-semibold text-indigo-600"
      : "text-gray-700";
    return (
      <Link
        href={href}
        passHref
        className={`flex items-center rounded-lg px-4 py-2 transition-colors hover:bg-gray-100 ${activeClasses}`}
      >
        <Icon className="mr-3" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans md:flex-row">
      {/* Sidebar for desktop. Now includes all five links. */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Planny</h1>
        <nav className="flex-1 space-y-2">
          <SidebarLink href="/plan" icon={Calendar} label="Plan" />
          <SidebarLink
            href="/plan/create"
            icon={ListChecks}
            label="Add to Plan"
          />
          <SidebarLink href="/meals" icon={Utensils} label="Meals" />
          <SidebarLink
            href="/shopping-list"
            icon={ShoppingBasket}
            label="Shopping List"
          />
          <SidebarLink href="/profile" icon={UserRound} label="Profile" />
        </nav>
        {session?.user && (
          <div className="mt-auto border-t border-gray-200 pt-4">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <LogOut className="mr-3" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-4 pb-20 md:p-8 md:pb-4">
        {children}
      </main>

      {/* Bottom navigation bar for mobile. Now includes all five links. */}
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white p-2 shadow-lg md:hidden">
        <nav className="flex items-center justify-around">
          <NavButton href="/plan" icon={Calendar} label="Plan" />
          <NavButton
            href="/plan/create"
            icon={ListChecks}
            label="Add to Plan"
          />
          <NavButton href="/meals" icon={Utensils} label="Meals" />
          <NavButton
            href="/shopping-list"
            icon={ShoppingBasket}
            label="Shopping List"
          />
          <NavButton href="/profile" icon={UserRound} label="Profile" />
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
