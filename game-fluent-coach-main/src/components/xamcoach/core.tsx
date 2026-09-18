import { useState, type ReactNode } from "react";
import { ChevronDown, Database, ExternalLink, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageIntro({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>{eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>}<h2 className="text-[28px] font-bold tracking-tight md:text-[30px]">{title}</h2>{description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{actions && <div className="flex shrink-0 gap-2">{actions}</div>}
  </div>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-end justify-between gap-3"><div><h3 className="text-lg font-bold">{title}</h3>{description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}</div>{action}</div>;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-border bg-card", className)}>{children}</section>;
}

export function MetricCard({ label, value, detail, trend }: { label: string; value: string; detail?: string; trend?: "up" | "down" }) {
  return <div className="border-l-2 border-data bg-card px-5 py-4 first:rounded-l-lg last:rounded-r-lg">
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-muted-foreground">{label}</p>{trend && <span className={trend === "up" ? "text-success" : "text-critical"}>{trend === "up" ? <TrendingUp className="size-3.5"/> : <TrendingDown className="size-3.5"/>}</span>}</div>
    <p className="mt-2 text-[26px] font-bold leading-none tabular-nums">{value}</p>{detail && <p className="mt-2 text-[11px] text-muted-foreground">{detail}</p>}
  </div>;
}

export function AIBadge({ label = "AI-generated" }: { label?: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-intelligence-border bg-intelligence px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-intelligence-foreground"><Sparkles className="size-3"/>{label}</span>;
}

const defaultSources = [
  ["Game database", "Toulouse vs Bourges · 14 Mar 2026"], ["Player statistics", "Last 5 games"],
  ["Coaching knowledge", "Spacing principles · Chapter 4"], ["Knowledge graph", "Pick-and-roll → Weak-side rotation"],
];
export function SourcePanel({ sources = defaultSources }: { sources?: string[][] }) {
  const [open, setOpen] = useState(false);
  return <div className="mt-4 border-t border-intelligence-border pt-3">
    <Button variant="ghost" size="sm" className="-ml-2 text-data" onClick={() => setOpen(!open)} aria-expanded={open}><Database/>Sources · {sources.length}<ChevronDown className={cn("transition-transform", open && "rotate-180")}/></Button>
    {open && <div className="mt-3 grid gap-2 sm:grid-cols-2">{sources.map(([name, detail]) => <div key={name} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3"><div><p className="text-xs font-semibold">{name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p></div><ExternalLink className="mt-0.5 size-3 text-muted-foreground"/></div>)}</div>}
  </div>;
}

export function AIInsight({ title, children, sources, className }: { title: string; children: ReactNode; sources?: string[][]; className?: string }) {
  return <Panel className={cn("border-intelligence-border bg-intelligence p-5", className)}><div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-bold">{title}</h3><AIBadge/></div><div className="mt-4 text-sm leading-6 text-secondary-foreground">{children}</div>{sources ? <SourcePanel sources={sources}/> : <SourcePanel/>}</Panel>;
}

export function ComparisonBar({ label, value, average, max = 100, unit = "" }: { label: string; value: number; average: number; max?: number; unit?: string }) {
  return <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{label}</span><span className="text-sm font-bold tabular-nums">{value}{unit}</span></div><div className="space-y-1.5"><div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-data" style={{ width: `${Math.min(100, value / max * 100)}%` }}/></div><div className="flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-secondary"><div className="h-1.5 rounded-full bg-comparison" style={{ width: `${Math.min(100, average / max * 100)}%` }}/></div><span className="w-24 text-right text-[10px] text-muted-foreground">League {average}{unit}</span></div></div></div>;
}

export function StatusDot({ status = "Operational" }: { status?: string }) { return <span className="inline-flex items-center gap-2 text-xs font-semibold text-success"><span className="size-2 rounded-full bg-success"/>{status}</span>; }

export function DataPill({ children }: { children: ReactNode }) { return <span className="rounded-md bg-data-soft px-2 py-1 text-xs font-semibold tabular-nums text-data">{children}</span>; }
