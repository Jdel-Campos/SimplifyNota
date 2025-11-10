import * as React from "react";
import { cn } from "@/shared/ui/cn";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = ({ className, required, children, ...props }: LabelProps) => {
  return (
    <label className={cn("block text-sm font-medium text-gray-700 mb-2", className)} {...props}>
      <span className="inline-flex items-center gap-2">
        {children}
        {required ? <span className="text-red-500" aria-hidden>*</span> : null}
      </span>
    </label>
  );
};