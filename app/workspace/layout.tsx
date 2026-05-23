import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageContainer } from "@/components/custom/share/page-container";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Private dashboard: GitHub repositories, AI-generated test suites, Browserless executions, and credit usage.",
  robots: { index: false, follow: true },
};

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh">
      <PageContainer className="py-6">{children}</PageContainer>
    </main>
  );
}
