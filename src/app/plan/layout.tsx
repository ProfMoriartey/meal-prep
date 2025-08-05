// src/app/plan/layout.tsx

import Sidebar from "~/components/shared/Sidebar";
import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import "~/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(inter.className)}>
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
