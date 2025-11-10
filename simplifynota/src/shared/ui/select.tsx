import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        // idêntico ao Input (altura/borda/espacamento)
        "block w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4",
        "text-[15px] leading-tight shadow-sm min-w-0",
        "focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";