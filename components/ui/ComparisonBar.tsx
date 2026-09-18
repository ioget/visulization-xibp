export function ComparisonBar({
  label,
  value,
  average,
  max = 100,
  unit = "",
  averageLabel = "League",
}: {
  label: string;
  value: number;
  average: number;
  max?: number;
  unit?: string;
  averageLabel?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className="text-sm font-bold tabular-nums text-text-primary">
          {value}
          {unit}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-surface-secondary">
          <div
            className="h-2 rounded-full bg-brand-blue"
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-surface-secondary">
            <div
              className="h-1.5 rounded-full bg-text-muted"
              style={{ width: `${Math.min(100, (average / max) * 100)}%` }}
            />
          </div>
          <span className="max-w-32 shrink-0 truncate text-right text-[10px] text-text-secondary">
            {averageLabel} {average}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
