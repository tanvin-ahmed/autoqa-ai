import * as React from "react";

import { cn } from "@/lib/utils";

/** Same horizontal width and padding as the workspace header (`max-w-6xl`, responsive `px`). */
export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}
