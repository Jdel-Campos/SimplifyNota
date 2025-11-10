// shared/ui/live-badge.tsx
"use client";

import * as React from "react";
import { cn } from "@/shared/ui/cn";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function LiveBadge({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "live-badge flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        "bg-green-100 text-green-700",
        className
      )}
      {...props}
    >
      <span className="relative inline-block">
        <span className="live-dot block h-2 w-2 rounded-full bg-green-600" />
      </span>
      Ao vivo
    </div>
  );
}