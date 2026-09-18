import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CalendarRange, ChevronRight, ClipboardCheck, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIInsight, MetricCard, PageIntro, Panel, SectionHeading } from "@/components/xamcoach/core";

const actions = [
  { to: "/ask-coach", title: "Ask Coach", detail: "Query team intelligence", icon: Bot },
  { to: "/pre-match", title: "Prepare next opponent", detail: "Lyon · Saturday", icon: Swords },
  { to: "/post-match", title: "Review latest game", detail: "Bourges · W 74–68", icon: ClipboardCheck },
  { to: "/practice", title: "Plan today's practice", detail: "90-minute session", icon: CalendarRange },
] as const;
const activity = [
  ["Post-match report generated", "Bourges · Today, 08:12"], ["Toulouse vs Lyon analyzed", "Yesterday, 17:40"],
  ["Marine Fauthoux report generated", "Yesterday, 14:22"], ["Practice plan created", "Monday, 09:10"],
];
export function HomePage() {
  return <>
    <PageIntro eyebrow="Wednesday · 16 September" title="Good morning, Coach" description="Your team's intelligence at a glance." />
    <SectionHeading title="Start here" description="The four most useful actions for today's coaching workflow"/>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map(({to,title,detail,icon:Icon}) => <Link key={to} to={to} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="size-5"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span></span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"/></Link>)}</div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
      <div className="space-y-6">
        <div><SectionHeading title="Team snapshot" description="Toulouse Métropole · Ligue Féminine" action={<span className="text-[11px] font-semibold text-data">Verified data</span>}/><div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Record" value="7–4" detail="5th in league" trend="up"/><MetricCard label="Points / game" value="71.8" detail="+2.9 vs league" trend="up"/><MetricCard label="Opp. points" value="68.4" detail="6th best defense"/><MetricCard label="3P rate" value="34.2%" detail="Last 5: 36.8%" trend="up"/></div></div>
        <AIInsight title="Today’s intelligence brief"><ul className="space-y-2"><li><strong>Transition defense</strong> remains the clearest training priority: opponents scored 17.4 fast-break points across the last three games.</li><li><strong>Lyon’s weak-side corner</strong> produces 38% of their made threes. Plan early low-man rotations before Saturday.</li></ul></AIInsight>
      </div>
      <div className="space-y-6">
        <Panel className="overflow-hidden"><div className="border-b border-border p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Next game</p><h3 className="mt-1 text-base font-bold">Saturday · 20:00</h3></div><span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold text-warning-foreground">3 days</span></div></div><div className="p-5"><div className="flex items-center justify-between"><TeamMark abbr="TMB" name="Toulouse" record="7–4"/><div className="px-3 text-center"><p className="text-[10px] font-bold text-muted-foreground">ROUND 12</p><p className="mt-1 text-sm font-black">VS</p></div><TeamMark abbr="LYO" name="Lyon" record="8–3" align="right"/></div><Button asChild className="mt-5 w-full"><Link to="/pre-match">Open match preparation<ArrowRight/></Link></Button></div></Panel>
        <Panel><div className="border-b border-border p-5"><SectionHeading title="Recent activity"/></div><div className="divide-y divide-border">{activity.map(([title,time]) => <div key={title} className="flex gap-3 px-5 py-3.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-data"/><div><p className="text-xs font-semibold">{title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{time}</p></div></div>)}</div></Panel>
      </div>
    </div>
  </>;
}
function TeamMark({abbr,name,record,align="left"}:{abbr:string;name:string;record:string;align?:"left"|"right"}) { return <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}><span className="grid size-11 place-items-center rounded-lg bg-foreground text-xs font-black text-background">{abbr}</span><div><p className="text-sm font-bold">{name}</p><p className="text-xs tabular-nums text-muted-foreground">{record}</p></div></div> }
