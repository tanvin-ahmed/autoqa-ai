"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { PageContainer } from "@/components/custom/share/page-container";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/workspace", label: "Workspace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
] as const;

function ClerkAwareAuthIsland() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-label="Loading account"
        className="inline-flex h-8 min-w-[4.75rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-2 text-[11px] text-muted-foreground"
      >
        …
      </span>
    );
  }

  if (userId) {
    return (
      <UserButton
        appearance={{
          elements: { avatarBox: "h-8 w-8" },
        }}
      />
    );
  }

  return (
    <>
      <Button asChild variant="outline" size="sm" className="sm:hidden">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <div className="hidden gap-2 sm:flex sm:items-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Get started</Link>
        </Button>
      </div>
    </>
  );
}

type WorkspaceHeaderProps = {
  /** When false (Clerk keys not configured), skip Clerk primitives and fall back to sign-in links only. */
  clerkAuthConfigured: boolean;
};

const WorkspaceHeader = ({ clerkAuthConfigured }: WorkspaceHeaderProps) => {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const authChrome = clerkAuthConfigured ? (
    <ClerkAwareAuthIsland />
  ) : (
    <Button asChild variant="outline" size="sm">
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <PageContainer className="flex h-14 items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Auto QA home"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={51}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 sm:flex"
          aria-label="Main navigation"
        >
          {nav.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isActive &&
                    "bg-accent text-accent-foreground hover:bg-accent",
                )}
              >
                <Link href={href}>{label}</Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {authChrome}
          <ModeToggle />
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Move between workspace, plans, or help—we keep the IA identical on every screen width.
                </SheetDescription>
              </SheetHeader>
              <nav
                className="mt-8 flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {nav.map(({ href, label }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Button
                      key={href}
                      variant="ghost"
                      asChild
                      className={cn(
                        "h-11 w-full justify-start text-base font-normal text-muted-foreground hover:text-foreground",
                        isActive &&
                          "bg-accent font-medium text-accent-foreground hover:bg-accent",
                      )}
                    >
                      <Link href={href} onClick={() => setMobileNavOpen(false)}>
                        {label}
                      </Link>
                    </Button>
                  );
                })}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link href="/sign-in" onClick={() => setMobileNavOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-center">
                    <Link href="/sign-up" onClick={() => setMobileNavOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
};

export default WorkspaceHeader;
