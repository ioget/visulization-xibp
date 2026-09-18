"use client";

import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Button,
  Card,
  ComparisonBar,
  EmptyState,
  MetricCard,
  MiniTrend,
  Select,
  SectionHeading,
  ShotChart,
} from "@/components/ui";
import { players } from "@/lib/players-data";

const zones: [string, string, string, string][] = [
  ["At rim", "63.8%", "26%", "1.28"],
  ["Paint", "48.2%", "18%", "0.96"],
  ["Mid-range", "41.4%", "15%", "0.83"],
  ["3PT", "36.7%", "41%", "1.10"],
];

export default function PlayersPage() {
  const [pendingId, setPendingId] = useState(players[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setActiveId(pendingId);
  };

  const player = players.find((p) => p.id === activeId) ?? null;

  return (
    <AppShell title="Players" breadcrumb="Intelligence">
      <PageHeader
        title="Player Analysis"
        description="Select a player to explore their season profile, shooting tendencies and creation context."
      />

      <Card className="mb-6 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select
              label="Player"
              value={pendingId}
              onChange={(e) => setPendingId(e.target.value)}
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.position}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="sm:mb-0">
            View player
          </Button>
        </form>
      </Card>

      {!player ? (
        <EmptyState
          icon={<UserRound className="h-6 w-6" aria-hidden="true" />}
          title="No player selected"
          description="Choose a player above and select “View player” to explore their performance, shot profile and development trends."
        />
      ) : (
        <>
          <Card className="mb-6 overflow-hidden">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-surface-secondary text-text-secondary">
                <UserRound className="h-9 w-9" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-blue">
                  {player.position} · {player.team}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-text-primary">{player.name}</h2>
                <p className="mt-1 text-xs text-text-secondary">
                  #{player.number} · {player.height} · {player.age}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                {[
                  ["PPG", player.ppg],
                  ["AST", player.apg],
                  ["REB", player.rpg],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold text-text-secondary">{l}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <SectionHeading title="Performance" description="Verified season statistics · 11 games" />
                <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="FG%" value={player.fg} detail={player.fgDetail} trend="up" />
                  <MetricCard label="3P%" value={player.threeP} detail={player.threePDetail} />
                  <MetricCard label="Usage" value={player.usage} detail={player.usageDetail} />
                  <MetricCard label="AST / TOV" value={player.astTov} detail={player.astTovDetail} trend="up" />
                </div>
              </div>

              <Card className="p-5">
                <SectionHeading title="Recent form" description="Game score · last 9 appearances" />
                <MiniTrend />
                <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
                  <span>vs BLMA</span>
                  <span>vs BOUR</span>
                  <span>vs TMB</span>
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeading title="Creation profile" description="Share of made field goals" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <ComparisonBar label="Assisted" value={player.assisted} average={53} unit="%" />
                  <ComparisonBar label="Unassisted" value={player.unassisted} average={47} unit="%" />
                </div>
              </Card>
            </div>

            <div>
              <SectionHeading title="Shot profile" description="All attempts · regular season" />
              <Card className="p-4">
                <ShotChart />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-105 text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase text-text-secondary">
                        <th className="pb-2 font-semibold">Zone</th>
                        <th className="pb-2 text-right font-semibold">FG%</th>
                        <th className="pb-2 text-right font-semibold">Frequency</th>
                        <th className="pb-2 text-right font-semibold">Pts / shot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zones.map((zone) => (
                        <tr key={zone[0]} className="border-b border-border last:border-0">
                          <td className="py-3 font-semibold text-text-primary">{zone[0]}</td>
                          {zone.slice(1).map((x) => (
                            <td key={x} className="py-3 text-right font-medium tabular-nums text-text-primary">
                              {x}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
