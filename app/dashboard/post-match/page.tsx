"use client";

import { useState, type FormEvent } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AIBadge,
  AIInsight,
  Button,
  Card,
  EmptyState,
  GameFlow,
  MetricCard,
  Select,
  SectionHeading,
} from "@/components/ui";
import { pastGames } from "@/lib/games-data";

const keyPerformers: [string, string][] = [
  ["M. Johannès", "19 PTS · 5 AST"],
  ["A. Rupert", "14 PTS · 11 REB"],
  ["M. Fauthoux", "12 PTS · 8 AST"],
];

const nextSteps = [
  "Retain the 2-2-1 pressure package after dead balls.",
  "Add defensive rebounding constraints to Thursday practice.",
  "Review weak-side spacing before the next preparation cycle.",
];

export default function PostMatchPage() {
  const [pendingId, setPendingId] = useState(pastGames[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setActiveId(pendingId);
  };

  const game = pastGames.find((g) => g.id === activeId) ?? null;
  const won = game ? game.ourScore > game.theirScore : false;

  return (
    <AppShell title="Post-Match" breadcrumb="Game">
      <PageHeader
        eyebrow={game?.eyebrow}
        title={game ? "What happened?" : "Post-Match Review"}
        description={
          game
            ? `Post-match intelligence · Toulouse Métropole vs ${game.opponent}`
            : "Select a completed game to review what happened and what changes going forward."
        }
      />

      <Card className="mb-6 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select label="Game" value={pendingId} onChange={(e) => setPendingId(e.target.value)}>
              {pastGames.map((g) => (
                <option key={g.id} value={g.id}>
                  Toulouse {g.ourScore} – {g.theirScore} {g.opponent} · {g.date}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">View recap</Button>
        </form>
      </Card>

      {!game ? (
        <EmptyState
          icon={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
          title="No game selected"
          description="Choose a completed game above and select “View recap” to see the post-match intelligence."
        />
      ) : (
        <>
          <Card className="mb-6 p-6">
            <div className="mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-5 text-center">
              <div>
                <p className="text-sm font-bold text-text-primary">Toulouse</p>
                <p
                  className={`mt-2 text-5xl font-black tabular-nums ${won ? "text-text-primary" : "text-text-secondary"}`}
                >
                  {game.ourScore}
                </p>
              </div>
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${won ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}
                >
                  FINAL
                </span>
                <p className="mt-2 text-xs text-text-secondary">Q4 · 00:00</p>
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{game.opponent}</p>
                <p
                  className={`mt-2 text-5xl font-black tabular-nums ${won ? "text-text-secondary" : "text-text-primary"}`}
                >
                  {game.theirScore}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <Card className="p-5">
                <SectionHeading title="Game flow" description="Toulouse scoring progression" />
                <GameFlow />
              </Card>

              <AIInsight title="What decided the game?">
                <ul className="space-y-2">
                  <li>
                    <strong className="text-text-primary">Third-quarter pressure:</strong> a 14–3 run came
                    from four live-ball turnovers.
                  </li>
                  <li>
                    <strong className="text-text-primary">Second chances:</strong> Toulouse scored 13 points
                    from offensive rebounds.
                  </li>
                  <li>
                    <strong className="text-text-primary">Late execution:</strong> 6 points from empty-corner
                    actions in the final four minutes.
                  </li>
                </ul>
              </AIInsight>
            </div>

            <div className="space-y-6">
              <div>
                <SectionHeading title="Key numbers" />
                <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-3 xl:grid-cols-1">
                  <MetricCard label="Points off turnovers" value="21" detail={`${game.opponent}: 12`} trend="up" />
                  <MetricCard label="Second-chance pts" value="13" detail="+7 margin" trend="up" />
                  <MetricCard label="Paint points" value="36" detail={`${game.opponent}: 30`} />
                </div>
              </div>
              <Card>
                <div className="p-5">
                  <SectionHeading title="Key performers" />
                </div>
                {keyPerformers.map(([name, line]) => (
                  <div key={name} className="flex items-center justify-between border-t border-border px-5 py-3 text-xs">
                    <span className="font-semibold text-text-primary">{name}</span>
                    <span className="tabular-nums text-text-secondary">{line}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <Card className="mt-6 border-intelligence-border bg-intelligence p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">What changes going forward?</h3>
              <AIBadge />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {nextSteps.map((x, i) => (
                <div key={x} className="flex gap-3 rounded-lg bg-surface p-3 text-xs leading-5 text-text-primary">
                  <b className="text-brand-blue">0{i + 1}</b>
                  {x}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
