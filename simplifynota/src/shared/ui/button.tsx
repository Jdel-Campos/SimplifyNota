import * as React from "react";
import { cn } from "@/shared/ui/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline";
};

export const Button = ({ className, variant = "primary", ...props }: Props) => {
    const base =
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
    
        const variants = {
        primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 focus:ring-offset-white px-4 py-2 shadow",
        outline:
        "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2",
    };

    return <button className={cn(base, variants[variant], className)} {...props} />;
};