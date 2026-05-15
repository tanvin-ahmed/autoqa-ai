"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { PageContainer } from "@/components/custom/share/page-container";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/workspace", label: "Workspace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
] as const;

const WorkspaceHeader = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <PageContainer className="flex h-14 items-center justify-between gap-4">
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
          className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1"
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

        <div className="flex shrink-0 items-center gap-3">
          <UserButton
            appearance={{
              elements: { avatarBox: "h-8 w-8" },
            }}
          />
          <ModeToggle />
        </div>
      </PageContainer>
    </header>
  );
};

export default WorkspaceHeader;
