"use client";

import { toast } from "sonner";

const GITHUB_REQUIRED_TOAST_ID = "workspace-github-required";

/** When GitHub OAuth cookie is missing; generate/run need GitHub-backed context. */
export function toastGitHubRequiredForWorkspace(): void {
  toast.error("GitHub is not connected", {
    id: GITHUB_REQUIRED_TOAST_ID,
    description: "Connect GitHub from the workspace, then retry.",
    duration: 10_000,
  });
}
