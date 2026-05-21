"use client";

import axios from "axios";
import { toast } from "sonner";

const INSUFFICIENT_CREDITS_TOAST_ID = "insufficient-credits";

/** Shown when the user has no credits or the API rejects for insufficient credits. */
export function toastPayBeforeRunning(): void {
  toast.error("Add credits to continue", {
    id: INSUFFICIENT_CREDITS_TOAST_ID,
    description:
      "You've run out of credits. Open pricing to purchase more before generating tests or running hosted browser sessions.",
    duration: 12_000,
    action: {
      label: "View pricing",
      onClick: () => {
        window.location.assign("/pricing");
      },
    },
  });
}

export function hasNoCredits(balance: number | null | undefined): boolean {
  if (balance == null) return false;
  return Number.isFinite(balance) && balance <= 0;
}

/** True when the server rejected the operation for insufficient credits. */
export function isInsufficientCreditsAxiosResponse(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  if (status === 402) return true;

  const data = error.response?.data;
  const msg =
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : "";

  return /insufficient credits/i.test(msg);
}
