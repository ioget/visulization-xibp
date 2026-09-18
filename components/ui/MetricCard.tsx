import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  trend,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  trend?: "up" | "down";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-l-2 border-brand-blue bg-surface px-5 py-4 first:rounded-l-lg last:rounded-r-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-text-secondary">{label}</p>
        {trend && (
          <span className={trend === "up" ? "text-success" : "text-error"} aria-hidden="true">
            {trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </div>
      <p className="mt-2 text-[26px] font-bold leading-none tabular-nums text-text-primary">
        {value}
      </p>
      {detail && <p className="mt-2 text-[11px] text-text-secondary">{detail}</p>}
    </div>
  );
}
