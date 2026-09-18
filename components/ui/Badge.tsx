import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "orange" | "blue";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-[#92660a]",
  error: "bg-error/10 text-error",
  neutral: "bg-surface-secondary text-text-secondary",
  orange: "bg-brand-orange-soft text-brand-orange",
  blue: "bg-brand-blue/10 text-brand-blue",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-text-muted",
  orange: "bg-brand-orange",
  blue: "bg-brand-blue",
};

export function Badge({ className, variant = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
}
