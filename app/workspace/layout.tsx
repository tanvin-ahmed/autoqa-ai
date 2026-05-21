import type { ReactNode } from "react";

import { PageContainer } from "@/components/custom/share/page-container";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="min-h-dvh">
      <PageContainer className="py-6">{children}</PageContainer>
    </main>
  );
};

export default layout;
