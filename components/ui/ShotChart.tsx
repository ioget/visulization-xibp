const shots: Array<[number, number, 0 | 1]> = [
  [49, 75, 1],
  [55, 70, 1],
  [43, 72, 0],
  [34, 64, 1],
  [66, 61, 0],
  [26, 49, 1],
  [77, 52, 0],
  [20, 31, 1],
  [84, 35, 1],
  [50, 45, 0],
  [38, 38, 1],
  [62, 35, 1],
  [13, 17, 0],
  [89, 20, 1],
  [49, 22, 1],
  [32, 24, 0],
  [69, 23, 1],
];

export function ShotChart({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-court ${compact ? "h-52" : "h-72"}`}
      aria-label="Half-court shot chart"
    >
      <svg viewBox="0 0 100 70" className="h-full w-full" role="img" aria-label="Made and missed shot locations">
        <path
          d="M5 68V4h90v64M39 4a11 11 0 0 0 22 0M50 7v8M46 15h8M35 4v23h30V4M20 68a34 34 0 0 1 60 0"
          fill="none"
          stroke="var(--color-court-line)"
          strokeWidth={0.7}
        />
        {shots.map(([x, y, made], i) =>
          made ? (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.6}
              fill="var(--color-success)"
              stroke="var(--color-surface)"
              strokeWidth={0.6}
            />
          ) : (
            <g key={i} stroke="var(--color-error)" strokeWidth={1}>
              <path d={`M${x - 1.5} ${y - 1.5}l3 3M${x + 1.5} ${y - 1.5}l-3 3`} />
            </g>
          ),
        )}
      </svg>
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-md border border-border bg-surface/90 px-2.5 py-1.5 text-[10px]">
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-success" />
          Made
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-error" />
          Missed
        </span>
      </div>
    </div>
  );
}
