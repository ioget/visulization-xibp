import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarRange,
  ChevronRight,
  ClipboardCheck,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIInsight, Card, MetricCard, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Dashboard — XamCoach",
};

const quickActions: {
  href: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/dashboard/ask-coach",
    title: "Ask Coach",
    detail: "Query team intelligence",
    icon: Bot,
  },
  {
    href: "/dashboard/pre-match",
    title: "Prepare next opponent",
    detail: "Lyon · Saturday",
    icon: Swords,
  },
  {
    href: "/dashboard/post-match",
    title: "Review latest game",
    detail: "Bourges · W 74–68",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/practice",
    title: "Plan today's practice",
    detail: "90-minute session",
    icon: CalendarRange,
  },
];

const recentActivity: { title: string; time: string }[] = [
  { title: "Post-match report generated", time: "Bourges · Today, 08:12" },
  { title: "Toulouse vs Lyon analyzed", time: "Yesterday, 17:40" },
  { title: "Marine Fauthoux report generated", time: "Yesterday, 14:22" },
  { title: "Practice plan created", time: "Monday, 09:10" },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" breadcrumb="Overview">
      <PageHeader
        eyebrow="Wednesday · September 16"
        title="Good morning, Coach"
        description="Your team's intelligence at a glance."
      />

      <SectionHeading
        title="Start here"
        description="The four most useful actions for today's coaching workflow"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ href, title, detail, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-brand-orange/30 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-orange-soft text-brand-orange">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary">{title}</span>
              <span className="mt-0.5 block truncate text-xs text-text-secondary">{detail}</span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="space-y-6">
          <div>
            <SectionHeading
              title="Team snapshot"
              description="Toulouse Métropole · Ligue Féminine"
              action={<span className="text-[11px] font-semibold text-brand-blue">Verified data</span>}
            />
            <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Record" value="7–4" detail="5th in league" trend="up" />
              <MetricCard label="Points / game" value="71.8" detail="+2.9 vs league" trend="up" />
              <MetricCard label="Opp. points" value="68.4" detail="6th best defense" />
              <MetricCard label="3P rate" value="34.2%" detail="Last 5: 36.8%" trend="up" />
            </div>
          </div>

          <AIInsight title="Today's intelligence brief">
            <ul className="space-y-2">
              <li>
                <strong className="text-text-primary">Transition defense</strong> remains the clearest
                training priority: opponents scored 17.4 fast-break points across the last three games.
              </li>
              <li>
                <strong className="text-text-primary">Lyon&apos;s weak-side corner</strong> produces 38% of
                their made threes. Plan early low-man rotations before Saturday.
              </li>
            </ul>
          </AIInsight>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-orange">
                    Next game
                  </p>
                  <h3 className="mt-1 text-base font-bold text-text-primary">Saturday · 20:00</h3>
                </div>
                <span className="rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-bold text-[#92660a]">
                  3 days
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <TeamMark abbr="TMB" name="Toulouse" record="7–4" />
                <div className="px-3 text-center">
                  <p className="text-[10px] font-bold text-text-muted">ROUND 12</p>
                  <p className="mt-1 text-sm font-black text-text-primary">VS</p>
                </div>
                <TeamMark abbr="LYO" name="Lyon" record="8–3" align="right" />
              </div>
              <Link
                href="/dashboard/pre-match"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-orange text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-brand-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Open match preparation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          <Card>
            <div className="border-b border-border p-5">
              <SectionHeading title="Recent activity" />
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map(({ title, time }) => (
                <div key={title} className="flex gap-3 px-5 py-3.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{title}</p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function TeamMark({
  abbr,
  name,
  record,
  align = "left",
}: {
  abbr: string;
  name: string;
  record: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-text-primary text-xs font-black text-white">
        {abbr}
      </span>
      <div>
        <p className="text-sm font-bold text-text-primary">{name}</p>
        <p className="text-xs tabular-nums text-text-secondary">{record}</p>
      </div>
    </div>
  );
}
