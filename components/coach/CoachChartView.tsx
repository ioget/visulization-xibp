"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CoachChart } from "@/lib/api-client";

const SERIES_COLORS = ["var(--color-brand-blue)", "var(--color-brand-orange)", "var(--color-success)", "var(--color-error)"];

/** Renders llm/response_formatter.py's optional `chart` field (a
 * trend/comparison the LLM judged worth a real visual, see
 * llm/prompt_templates.py's "chart" field instructions) as a native React
 * chart instead of the coach reading `x_labels`/`series` numbers as plain
 * JSON -- the whole point of the earlier "raw data, not a PNG" decision
 * was to let the frontend draw this properly. */
export function CoachChartView({ chart }: { chart: CoachChart }) {
  const data = chart.x_labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    for (const s of chart.series) row[s.name] = s.values[i] ?? null;
    return row;
  });

  const ChartTag = chart.type === "bar" ? BarChart : LineChart;

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 text-xs font-bold text-text-primary">{chart.title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartTag data={data} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {chart.series.map((s, i) =>
              chart.type === "bar" ? (
                <Bar key={s.name} dataKey={s.name} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[4, 4, 0, 0]} />
              ) : (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ),
            )}
          </ChartTag>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
