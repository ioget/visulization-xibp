import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CalendarRange, ChevronRight, ClipboardCheck, Swords, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MatchSpotlight } from "@/components/dashboard/MatchSpotlight";

export const metadata: Metadata = {
  title: "Dashboard - XamCoach",
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
    detail: "Build a tactical briefing",
    icon: Swords,
  },
  {
    href: "/dashboard/post-match",
    title: "Review a game",
    detail: "Analyze a completed matchup",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/practice",
    title: "Plan practice",
    detail: "Build a training session",
    icon: CalendarRange,
  },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" breadcrumb="Overview">
      <PageHeader title="Good morning, Coach" description="Pick a workflow to get started." />

      <SectionHeading title="Start here" />
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

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_1.3fr]">
        <RecentActivity />
        <MatchSpotlight />
      </div>
    </AppShell>
  );
}
