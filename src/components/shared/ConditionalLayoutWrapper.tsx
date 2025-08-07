"use client";

import { usePathname } from "next/navigation";
import AppLayout from "~/components/shared/AppLayout";
import React from "react";

// A wrapper component that conditionally renders the layout based on the path.
const ConditionalLayoutWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();

  // If the path is the homepage, render only the children without the AppLayout.
  if (pathname === "/") {
    return <>{children}</>;
  }

  // For all other pages, render the children wrapped in the AppLayout.
  return <AppLayout>{children}</AppLayout>;
};

export default ConditionalLayoutWrapper;
