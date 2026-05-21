import WorkspaceBody from "@/components/custom/workspace/WorkspaceBody";
import { Suspense } from "react";

const WorkspacePage = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <WorkspaceBody />
      </Suspense>
    </div>
  );
};

export default WorkspacePage;
