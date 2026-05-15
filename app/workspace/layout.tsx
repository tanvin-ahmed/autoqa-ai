import { PageContainer } from "@/components/custom/share/page-container";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-dvh">
      <WorkspaceHeader />
      <PageContainer className="py-6">{children}</PageContainer>
    </main>
  );
};

export default layout;
