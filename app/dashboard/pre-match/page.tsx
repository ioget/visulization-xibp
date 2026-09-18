"use client";

import { useState, type FormEvent } from "react";
import { Calendar, ShieldAlert, Swords, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AIInsight,
  Button,
  Card,
  ComparisonBar,
  EmptyState,
  Select,
  SectionHeading,
} from "@/components/ui";
import { teams } from "@/lib/teams-data";

const briefing: [LucideIcon, string, string[]][] = [
  [TrendingUp, "What to expect", ["Early drag screens", "High-low entries", "Aggressive top-locks"]],
  [Target, "What to attack", ["Drop coverage depth", "Weak-side corner", "Slow floor balance"]],
  [ShieldAlert, "What to protect", ["Defensive glass", "Nail help timing", "Live-ball turnovers"]],
];

function TeamMark({ abbr, name, record }: { abbr: string; name: string; record: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-text-primary text-base font-black text-white">
        {abbr}
      </span>
      <h3 className="mt-3 text-lg font-bold text-text-primary">{name}</h3>
      <p className="text-xs tabular-nums text-text-secondary">{record}</p>
    </div>
  );
}

export default function PreMatchPage() {
  const [pendingHome, setPendingHome] = useState(teams[0].id);
  const [pendingAway, setPendingAway] = useState(teams[1].id);
  const [active, setActive] = useState<{ home: string; away: string } | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setActive({ home: pendingHome, away: pendingAway });
  };

  const home = active ? teams.find((t) => t.id === active.home) ?? null : null;
  const away = active ? teams.find((t) => t.id === active.away) ?? null : null;

  return (
    <AppShell title="Pre-Match" breadcrumb="Game">
      <PageHeader
        title="Pre-Match Preparation"
        description="Select the two teams to build a matchup briefing before gameday."
        actions={
          home && away ? (
            <Button type="button">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Add to game plan
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-6 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select label="Home team" value={pendingHome} onChange={(e) => setPendingHome(e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Select label="Opponent" value={pendingAway} onChange={(e) => setPendingAway(e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={pendingHome === pendingAway}>
            Preview matchup
          </Button>
        </form>
        {pendingHome === pendingAway && (
          <p className="mt-2 text-xs text-text-secondary">Choose two different teams to preview a matchup.</p>
        )}
      </Card>

      {!home || !away ? (
        <EmptyState
          icon={<Swords className="h-6 w-6" aria-hidden="true" />}
          title="No matchup selected"
          description="Choose the home team and the opponent above and select “Preview matchup” to see what you're walking into."
        />
      ) : (
        <>
          <Card className="mb-6 p-6 md:p-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <TeamMark abbr={home.abbr} name={home.name} record={home.record} />
              <div className="px-5 text-center">
                <p className="text-[10px] font-bold uppercase text-text-secondary">League</p>
                <p className="my-2 text-xl font-black text-text-primary">VS</p>
                <span className="rounded-full bg-warning/15 px-2 py-1 text-[10px] font-bold text-[#92660a]">
                  Saturday · 20:00
                </span>
              </div>
              <TeamMark abbr={away.abbr} name={away.name} record={away.record} />
            </div>
            <div className="mt-8 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
              {[
                ["Recent form", "W · W · L · W · W"],
                ["Season series", "First meeting"],
                ["Projected pace", `${((home.style.pace + away.style.pace) / 2).toFixed(1)} possessions`],
              ].map(([l, v]) => (
                <div key={l} className="text-center">
                  <p className="text-[10px] font-bold uppercase text-text-secondary">{l}</p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-text-primary">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="p-5">
              <SectionHeading title="Matchup" description={`${home.name} compared with ${away.name}`} />
              <div className="space-y-6">
                <ComparisonBar
                  label="Offensive rating"
                  value={home.style.ortg}
                  average={away.style.ortg}
                  max={120}
                  averageLabel={away.abbr}
                />
                <ComparisonBar
                  label="Pace"
                  value={home.style.pace}
                  average={away.style.pace}
                  max={80}
                  averageLabel={away.abbr}
                />
                <ComparisonBar
                  label="3P frequency"
                  value={home.style.threePFreq}
                  average={away.style.threePFreq}
                  max={50}
                  unit="%"
                  averageLabel={away.abbr}
                />
                <ComparisonBar
                  label="Defensive rebounding"
                  value={home.style.defReb}
                  average={away.style.defReb}
                  max={85}
                  unit="%"
                  averageLabel={away.abbr}
                />
              </div>
            </Card>

            <AIInsight title="Tactical briefing">
              <div className="grid gap-5 md:grid-cols-3">
                {briefing.map(([Icon, title, items]) => (
                  <div key={title}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                      <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-primary">{title}</h4>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {items.map((x) => (
                        <li key={x} className="flex gap-2 text-xs text-text-secondary">
                          <span className="text-brand-blue">•</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AIInsight>
          </div>
        </>
      )}
    </AppShell>
  );
}
