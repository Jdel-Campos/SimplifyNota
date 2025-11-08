import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30",
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = "Textarea";