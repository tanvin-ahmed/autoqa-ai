import React from "react";
import { cn } from "@/lib/utils";

type StatusCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  /** Tailwind background classes for the icon circle (include light + dark variants). */
  bgColor: string;
};

const StatusCard = ({ title, value, icon, bgColor }: StatusCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
      )}
    >
      <div className="min-w-0 pr-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </h3>
      </div>

      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          bgColor,
        )}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatusCard;
