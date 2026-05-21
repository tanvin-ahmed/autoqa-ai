"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";

type AppShellProps = {
  clerkAuthConfigured: boolean;
  children: ReactNode;
};

/** Hides sticky chrome on Clerk hosted-style auth routes so sign-in/up stay full-viewport without nav clutter. */
function shouldHideChrome(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/sign-in" ||
    pathname.startsWith("/sign-in/") ||
    pathname === "/sign-up" ||
    pathname.startsWith("/sign-up/")
  );
}

export function AppShell({ clerkAuthConfigured, children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = shouldHideChrome(pathname);

  return (
    <div className="flex min-h-dvh flex-col">
      {!hideChrome && (
        <WorkspaceHeader clerkAuthConfigured={clerkAuthConfigured} />
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
