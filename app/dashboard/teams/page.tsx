"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpDown, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, ComparisonBar, EmptyState, Select, SectionHeading } from "@/components/ui";
import { teams } from "@/lib/teams-data";

const leagueAverage = { pace: 68.9, ortg: 102.4, threePFreq: 34.1, defReb: 70.2 };

export default function TeamsPage() {
  const [pendingId, setPendingId] = useState(teams[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sort, setSort] = useState<"ppg" | "player">("ppg");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setActiveId(pendingId);
  };

  const team = teams.find((t) => t.id === activeId) ?? null;
  const rows = team
    ? [...team.roster].sort((a, b) => (sort === "ppg" ? b.ppg - a.ppg : a.player.localeCompare(b.player)))
    : [];

  return (
    <AppShell title="Teams" breadcrumb="Intelligence">
      <PageHeader
        title="Team Analysis"
        description="Select a team to view roster intelligence and league-relative playing style."
      />

      <Card className="mb-6 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select label="Team" value={pendingId} onChange={(e) => setPendingId(e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">View team</Button>
        </form>
      </Card>

      {!team ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" aria-hidden="true" />}
          title="No team selected"
          description="Choose a team above and select “View team” to see roster intelligence and playing style."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden">
            <div className="p-5">
              <SectionHeading
                title="Roster intelligence"
                description={`${team.name} · Regular season · verified data · ${team.record}`}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-135 text-left text-xs">
                <thead className="bg-surface-secondary text-[10px] uppercase text-text-secondary">
                  <tr>
                    {["Player", "Pos", "GP", "PPG", "RPG", "APG", "FG%", "3P%"].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 font-semibold ${h !== "Player" && h !== "Pos" ? "text-right" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => (h === "Player" ? setSort("player") : h === "PPG" && setSort("ppg"))}
                          className="inline-flex items-center gap-1"
                        >
                          {h}
                          {(h === "Player" || h === "PPG") && <ArrowUpDown className="h-3 w-3" aria-hidden="true" />}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.player}
                      className="border-t border-border transition-colors duration-150 ease-out hover:bg-surface-secondary/60"
                    >
                      <td className="px-4 py-3 font-semibold text-text-primary">{r.player}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.pos}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.gp}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.ppg}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.rpg}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.apg}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.fg}%</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">{r.threeP}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Team style" description="Compared with league average" />
            <div className="space-y-6">
              <ComparisonBar label="Pace" value={team.style.pace} average={leagueAverage.pace} max={80} />
              <ComparisonBar
                label="Offensive rating"
                value={team.style.ortg}
                average={leagueAverage.ortg}
                max={120}
              />
              <ComparisonBar
                label="3P frequency"
                value={team.style.threePFreq}
                average={leagueAverage.threePFreq}
                max={50}
                unit="%"
              />
              <ComparisonBar
                label="Defensive rebounding"
                value={team.style.defReb}
                average={leagueAverage.defReb}
                max={85}
                unit="%"
              />
            </div>
            <div className="mt-6 rounded-lg bg-brand-blue/10 p-4">
              <p className="text-xs font-bold text-brand-blue">Style signature</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{team.signature}</p>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
