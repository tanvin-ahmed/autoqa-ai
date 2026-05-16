"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

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
import { PageContainer } from "@/components/custom/share/page-container";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/workspace", label: "Workspace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
] as const;

const WorkspaceHeader = () => {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <PageContainer className="flex h-14 items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/workspace"
          className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Workspace home"
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
          <UserButton
            appearance={{
              elements: { avatarBox: "h-8 w-8" },
            }}
          />
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
                  Choose a section of the workspace.
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
};

export default WorkspaceHeader;
