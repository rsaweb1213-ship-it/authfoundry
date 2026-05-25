import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:
      "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900",
    secondary:
      "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
    outline:
      "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };