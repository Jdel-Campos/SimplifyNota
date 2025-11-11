import * as React from "react";
import { cn } from "@/shared/ui/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export const Button = ({ className, variant = "primary", ...props }: Props) => {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 shadow-lg " +
      "hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] " +
      "focus:ring-blue-600 focus:ring-offset-white",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
};