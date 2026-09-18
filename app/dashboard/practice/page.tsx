"use client";

import { useState } from "react";
import { Check, ChevronDown, Clock, Download, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, Button, Card, SectionHeading, SourcePanel } from "@/components/ui";
import { cn } from "@/lib/utils";

const focusAreas = [
  "Transition defense",
  "Defensive rebounding",
  "Pick-and-roll coverage",
  "Late-game offense",
];

const timeline: [string, string, string][] = [
  ["00:00", "Dynamic warm-up", "10 min"],
  ["00:10", "Defensive activation", "15 min"],
  ["00:25", "P&R coverage", "25 min"],
  ["00:50", "Transition defense", "20 min"],
  ["01:10", "Controlled scrimmage", "20 min"],
];

const steps = ["Identify weakness", "Select focus", "Generate session", "Review", "Export"];

export default function PracticePage() {
  const [selected, setSelected] = useState<string[]>(focusAreas.slice(0, 3));
  const [generated, setGenerated] = useState(false);

  return (
    <AppShell title="Practice Planner" breadcrumb="Coaching">
      <PageHeader
        title="Practice Planner"
        description="Turn the latest performance signals into a focused coaching session."
        actions={
          generated ? (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:bg-surface-secondary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export session
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 hidden items-center justify-center gap-3 text-xs font-semibold text-text-secondary md:flex">
        {steps.map((x, i) => (
          <div key={x} className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full",
                i <= (generated ? 3 : 1) ? "bg-brand-orange text-white" : "bg-surface-secondary",
              )}
            >
              {i + 1}
            </span>
            {x}
            {i < 4 && <span className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="p-5">
          <SectionHeading title="Session setup" />
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-text-primary">Team</span>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-lg border border-border px-3 text-sm text-text-primary"
              >
                Toulouse Métropole
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </label>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">Focus areas</span>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((x) => {
                  const isSelected = selected.includes(x);
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setSelected((s) => (s.includes(x) ? s.filter((i) => i !== x) : [...s, x]))
                      }
                      key={x}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ease-out",
                        isSelected
                          ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                          : "border-border bg-surface text-text-secondary",
                      )}
                    >
                      {isSelected && <Check className="mr-1 inline h-3 w-3" aria-hidden="true" />}
                      {x}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-text-primary">Duration</span>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-lg border border-border px-3 text-sm text-text-primary"
              >
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                  90 minutes
                </span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </label>

            <Button type="button" fullWidth onClick={() => setGenerated(true)}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate Practice Plan
            </Button>
          </div>
        </Card>

        {generated ? (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <SectionHeading title="Thursday session" description="90 min · Toulouse Métropole" />
              <AIBadge />
            </div>
            <div className="mt-2">
              {timeline.map(([time, title, duration], i) => (
                <div key={time} className="grid grid-cols-[54px_20px_1fr_auto] gap-3">
                  <span className="pt-3 text-xs font-bold tabular-nums text-brand-blue">{time}</span>
                  <div className="flex flex-col items-center">
                    <span className="mt-3 h-2.5 w-2.5 rounded-full bg-brand-blue" />
                    {i < timeline.length - 1 && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="border-b border-border py-3">
                    <p className="text-sm font-semibold text-text-primary">{title}</p>
                    <p className="mt-1 text-xs text-text-secondary">High-intent reps · two coaching constraints</p>
                  </div>
                  <span className="py-3 text-xs font-semibold tabular-nums text-text-secondary">{duration}</span>
                </div>
              ))}
            </div>
            <SourcePanel
              sources={[
                { name: "Team performance", detail: "Last 3 games" },
                { name: "Practice library", detail: "Defensive concepts · Level 2" },
                { name: "Coaching knowledge", detail: "Session load guidelines" },
              ]}
            />
          </Card>
        ) : (
          <Card className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-surface-secondary text-text-secondary">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">Your session will appear here</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
                Choose the focus areas and generate a timed, coach-ready plan.
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
