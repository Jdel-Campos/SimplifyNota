import * as React from "react";
import { cn } from "@/shared/ui/cn";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
    return <label className={cn("block text-sm font-medium text-gray-700", className)} {...props} />;
};