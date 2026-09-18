export function MiniTrend({ values = [42, 48, 45, 56, 53, 61, 58, 66, 64] }: { values?: number[] }) {
  const points = values.map((v, i) => `${i * (100 / (values.length - 1))},${75 - v}`).join(" ");

  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-32 w-full" aria-label="Performance trend">
      <path d="M0 34H100M0 20H100M0 6H100" stroke="var(--color-border)" strokeWidth={0.5} />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-brand-blue)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      <polyline points={`0,40 ${points} 100,40`} fill="var(--color-data-area)" stroke="none" />
    </svg>
  );
}
