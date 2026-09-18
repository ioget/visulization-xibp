"use client";

import { useState } from "react";
import { Check, ChevronDown, Download, FileText, Printer, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, Button, Card, MetricCard, MiniTrend, ShotChart, SourcePanel } from "@/components/ui";

const included = [
  "Player profile",
  "Performance analysis",
  "Shot profile",
  "SWOT analysis",
  "Development plan",
  "Exportable PDF",
  "Exportable Word document",
];

const swot: [string, string][] = [
  ["Strengths", "Shot versatility; advantage creation; late-clock confidence."],
  ["Weaknesses", "Turnover rate under blitz pressure; rim frequency."],
  ["Opportunities", "More empty-corner P&R; second-side actions."],
  ["Threats", "Physical top-locking; fatigue across dense schedule."],
];

const developmentPlan = [
  "Build blitz reads through constrained 2-on-2 decision drills.",
  "Increase left-hand rim finishes under contact twice weekly.",
  "Create one early-clock catch-and-shoot action per quarter.",
];

const shotZones: [string, string][] = [
  ["At rim", "63.8%"],
  ["Paint", "48.2%"],
  ["Mid-range", "41.4%"],
  ["3PT", "36.7%"],
];

export default function ScoutingPage() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 1200);
  };

  if (!generated) {
    return (
      <AppShell title="Scouting" breadcrumb="Game">
        <PageHeader
          title="Player Development Report"
          description="Build a coach-ready player report from verified performance data and AI-assisted analysis."
        />
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary">Report setup</h3>
            <div className="mt-6 space-y-5">
              {[
                ["Player", "Marine Johannès"],
                ["Reporting period", "2025–26 season"],
                ["Report depth", "Full development report"],
              ].map(([l, v]) => (
                <label key={l} className="block">
                  <span className="mb-2 block text-xs font-semibold text-text-primary">{l}</span>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
                  >
                    <span>{v}</span>
                    <ChevronDown className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                  </button>
                </label>
              ))}
              <Button type="button" fullWidth size="lg" onClick={generate} disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
                    XamCoach is analyzing
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Generate Report
                  </>
                )}
              </Button>
              {loading && (
                <div className="space-y-2 rounded-lg bg-intelligence p-4 text-xs text-text-secondary">
                  <p>Checking game statistics</p>
                  <p>Reviewing player trends</p>
                  <p>Consulting basketball knowledge</p>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-bold text-text-primary">Your report will include</h3>
            <div className="mt-4 space-y-3">
              {included.map((x) => (
                <div key={x} className="flex items-center gap-3 text-sm text-text-primary">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {x}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Scouting" breadcrumb="Game">
      <PageHeader
        eyebrow="Generated 16 Sep 2026"
        title="Player Development Report"
        description="Marine Johannès · 2025–26 season"
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:bg-surface-secondary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              PDF
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:bg-surface-secondary"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Word
            </button>
            <Button type="button" size="sm">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </Button>
          </>
        }
      />

      <article className="mx-auto max-w-5xl rounded-xl border border-border bg-surface shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
        <div className="border-b-4 border-text-primary p-6 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-orange">
            XamCoach Intelligence
          </p>
          <h2 className="mt-4 text-3xl font-bold uppercase text-text-primary">Player Development Report</h2>
          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-text-primary">Marine Johannès</p>
              <p className="text-sm text-text-secondary">Guard · Lyon ASVEL · #23</p>
            </div>
            <p className="text-right text-xs text-text-secondary">
              CONFIDENTIAL
              <br />
              COACHING STAFF
            </p>
          </div>
        </div>

        <div className="space-y-10 p-6 md:p-10">
          <section>
            <ReportTitle n="01" title="Performance summary" />
            <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-4">
              <MetricCard label="PPG" value="14.8" />
              <MetricCard label="AST" value="4.2" />
              <MetricCard label="FG%" value="48.1%" />
              <MetricCard label="Usage" value="24.6%" />
            </div>
            <div className="mt-5">
              <MiniTrend />
            </div>
          </section>

          <section>
            <ReportTitle n="02" title="Shot profile" />
            <div className="grid gap-5 md:grid-cols-[1fr_0.7fr]">
              <ShotChart compact />
              <div className="space-y-4">
                {shotZones.map(([a, b]) => (
                  <div key={a} className="flex justify-between border-b border-border pb-3 text-sm text-text-primary">
                    <span>{a}</span>
                    <b className="tabular-nums">{b}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <ReportTitle n="03" title="SWOT analysis" />
              <AIBadge />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {swot.map(([h, t]) => (
                <div key={h} className="rounded-lg border border-intelligence-border bg-intelligence p-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-brand-blue">{h}</h4>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{t}</p>
                </div>
              ))}
            </div>
            <SourcePanel />
          </section>

          <section>
            <div className="flex items-center justify-between">
              <ReportTitle n="04" title="Development plan" />
              <AIBadge />
            </div>
            <ol className="space-y-3">
              {developmentPlan.map((x, i) => (
                <li key={x} className="flex gap-4 border-b border-border pb-3 text-sm text-text-primary">
                  <b className="text-brand-blue">0{i + 1}</b>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </AppShell>
  );
}

function ReportTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-xs font-black text-brand-orange">{n}</span>
      <h3 className="text-lg font-bold uppercase tracking-[0.04em] text-text-primary">{title}</h3>
    </div>
  );
}
