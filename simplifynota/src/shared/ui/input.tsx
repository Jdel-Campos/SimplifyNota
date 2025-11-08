import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
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

Input.displayName = "Input";