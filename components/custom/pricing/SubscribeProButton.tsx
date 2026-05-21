"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
};

export default function SubscribeProButton({ className, variant }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      });

      const data = (await res.json()) as {
        url?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Checkout could not start.");
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("Stripe did not return a redirect URL.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return (
      <Button
        type="button"
        size="lg"
        variant={variant ?? "default"}
        disabled
        className={cn(
          "w-full font-mono text-sm tracking-wide shadow-[0_12px_40px_-20px_rgb(79_70_229_/_0.6)]",
          variant === "default" &&
            "bg-primary text-primary-foreground shadow-[0_16px_48px_-18px_rgb(99_102_241_/_0.52)]",
          variant === "outline" &&
            "border-primary/35 bg-background/80 dark:bg-card/70",
          className,
        )}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        Loading…
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        type="button"
        size="lg"
        variant={variant ?? "default"}
        className={cn(
          "w-full font-mono text-sm tracking-wide shadow-[0_12px_40px_-20px_rgb(79_70_229_/_0.6)] motion-safe:transition-transform motion-safe:active:translate-y-[1px]",
          variant === "default" &&
            "bg-primary text-primary-foreground shadow-[0_16px_48px_-18px_rgb(99_102_241_/_0.52)] hover:bg-primary/90",
          variant === "outline" &&
            "border-primary/35 bg-background/80 hover:border-primary/55 hover:bg-muted/60 dark:bg-card/70",
          className,
        )}
        asChild
      >
        <Link
          href={`/sign-up?redirect_url=${encodeURIComponent("/pricing")}`}
        >
          Sign up to subscribe
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={variant ?? "default"}
      disabled={busy}
      className={cn(
        "w-full font-mono text-sm tracking-wide shadow-[0_12px_40px_-20px_rgb(79_70_229_/_0.6)] motion-safe:transition-transform motion-safe:active:translate-y-[1px]",
        variant === "default" &&
          "bg-primary text-primary-foreground shadow-[0_16px_48px_-18px_rgb(99_102_241_/_0.52)] hover:bg-primary/90",
        variant === "outline" &&
          "border-primary/35 bg-background/80 hover:border-primary/55 hover:bg-muted/60 dark:bg-card/70",
        className,
      )}
      onClick={() => {
        void startCheckout();
      }}
    >
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : null}
      {busy ? "Redirecting to Stripe…" : "Subscribe · $30/mo"}
    </Button>
  );
}
