import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "block w-full bg-white px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm " +
            "focus:outline-none focus:border-blue-500 focus:ring-0 transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";