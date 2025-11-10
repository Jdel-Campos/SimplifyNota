import * as React from "react";
import { cn } from "@/shared/ui/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "glass" | "plain";
};

export function Card({ className, variant = "glass", ...props }: CardProps) {
  const base =
    variant === "glass"
      ? "bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20"
      : "rounded-2xl border border-gray-200 bg-white shadow-sm";
  return <div className={cn(base, className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
