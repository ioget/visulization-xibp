"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

const METRIC_LABELS: Record<string, string> = {
  points_pct: "Points",
  rebounds_pct: "Rebounds",
  assists_pct: "Assists",
  steals_pct: "Steals",
  blocks_pct: "Blocks",
  eval_pct: "Eval",
};

/** retrieval/postgres_retriever.py::player_percentile_ranks() returns
 * percent_rank() fractions (0.0-1.0) keyed by "<metric>_pct", plus a
 * `player_id` key that is not a percentile at all -- rendering every key
 * as-is (as the previous version of this page did) showed "player id
 * 5783th pct" and "1th pct" instead of a real percentile. This filters to
 * the real metric keys and scales to 0-100 before display. */
export function PercentileRadar({ percentile }: { percentile: Record<string, number> }) {
  const data = Object.entries(percentile)
    .filter(([key]) => key in METRIC_LABELS)
    .map(([key, value]) => ({ metric: METRIC_LABELS[key], value: Math.round(value * 100) }));

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickCount={5} />
          <Radar dataKey="value" stroke="var(--color-brand-blue)" fill="var(--color-brand-blue)" fillOpacity={0.35} />
          <Tooltip
            formatter={(value) => [`${value}th percentile`, ""]}
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
