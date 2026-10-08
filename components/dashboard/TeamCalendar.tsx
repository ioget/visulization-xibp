"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import type { TeamOverviewResponse } from "@/lib/api-client";

type CalendarGame = TeamOverviewResponse["calendar_games"][number];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** The win/loss/tie signal is carried by the WHOLE cell (bold background +
 * thick border), not a thin ring on the small logo -- asked to be made
 * "much bigger and wider" after an initial pass that only tinted a 2px
 * ring around the badge. */
const RESULT_CELL: Record<string, string> = {
  win: "border-4 border-success bg-success/20",
  loss: "border-4 border-error bg-error/20",
  tie: "border-4 border-warning bg-warning/20",
};

const RESULT_TEXT: Record<string, string> = {
  win: "text-success",
  loss: "text-error",
  tie: "text-warning",
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Monday-first day-of-week index (0 = Monday .. 6 = Sunday), matching
 * WEEKDAYS above -- JS's own getDay() is Sunday-first (0 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function OpponentBadge({ game, size }: { game: CalendarGame; size: "sm" | "lg" }) {
  const dims = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const ring = game.result ? "ring-transparent" : "ring-brand-blue/40";
  if (game.opponent_logo_base64) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
      <img
        src={`data:image/png;base64,${game.opponent_logo_base64}`}
        alt={game.opponent_name}
        title={game.opponent_name}
        className={`${dims} shrink-0 rounded-full bg-white object-contain p-0.5 ring-2 ${ring}`}
      />
    );
  }
  return (
    <span title={game.opponent_name} className={`grid ${dims} shrink-0 place-items-center rounded-full bg-surface-secondary text-text-secondary ring-2 ${ring}`}>
      <Shield className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

export function TeamCalendar({ games }: { games: CalendarGame[] }) {
  const gamesByDate = useMemo(() => {
    const map = new Map<string, CalendarGame>();
    for (const g of games) {
      if (g.date) map.set(g.date, g);
    }
    return map;
  }, [games]);

  const initialMonth = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = games.find((g) => g.date && g.date >= today) ?? games[games.length - 1];
    return upcoming?.date ? startOfMonth(new Date(upcoming.date)) : startOfMonth(new Date());
  }, [games]);

  const [month, setMonth] = useState(initialMonth);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = mondayIndex(month);
  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex max-w-[50%] items-start gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-text-secondary hover:bg-surface-secondary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="text-sm font-bold capitalize text-text-primary">{monthLabel}</p>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            aria-label="Next month"
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-text-secondary hover:bg-surface-secondary"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-center text-[10px] font-bold uppercase text-text-muted">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day == null) return <div key={`blank-${i}`} />;
            const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const game = gamesByDate.get(dateStr);

            if (!game) {
              return (
                <div key={dateStr} className="flex aspect-square items-center justify-center rounded-lg text-xs text-text-muted">
                  {day}
                </div>
              );
            }

            const isScheduled = game.status !== "completed";
            const cellClass = isScheduled
              ? "border border-brand-blue/30 bg-brand-blue/5"
              : (game.result && RESULT_CELL[game.result]) || "border border-border bg-surface-secondary";
            return (
              <div
                key={dateStr}
                className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg ${cellClass}`}
              >
                {!isScheduled && (
                  <span className={`text-base font-black leading-none tabular-nums ${game.result ? RESULT_TEXT[game.result] ?? "text-text-secondary" : "text-text-secondary"}`}>
                    {day}
                  </span>
                )}
                <OpponentBadge game={game} size={isScheduled ? "lg" : "sm"} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex shrink-0 flex-col gap-2.5 text-[11px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-success bg-success/20" /> Win
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-error bg-error/20" /> Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-warning bg-warning/20" /> Tie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-brand-blue/30 bg-brand-blue/5" /> Scheduled
        </span>
      </div>
    </div>
  );
}
