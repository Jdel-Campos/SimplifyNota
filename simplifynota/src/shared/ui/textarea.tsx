import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
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
Textarea.displayName = "Textarea";
