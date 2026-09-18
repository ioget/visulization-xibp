import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-[0_4px_16px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
