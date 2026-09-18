import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Activity, Bell, BookOpen, Bot, CalendarRange, ChevronDown, ClipboardList,
  Home, Menu, Network, Settings, ShieldCheck, Swords, Users, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Overview", items: [{ to: "/", label: "Home", icon: Home }] },
  { label: "Intelligence", items: [
    { to: "/ask-coach", label: "Ask Coach", icon: Bot },
    { to: "/players", label: "Player Analysis", icon: Users },
    { to: "/team", label: "Team Analysis", icon: Activity },
  ]},
  { label: "Game preparation", items: [
    { to: "/scouting", label: "Scouting", icon: ShieldCheck },
    { to: "/pre-match", label: "Pre-Match", icon: Swords },
    { to: "/post-match", label: "Post-Match", icon: ClipboardList },
  ]},
  { label: "Coaching", items: [{ to: "/practice", label: "Practice Planner", icon: CalendarRange }] },
  { label: "Explore", items: [{ to: "/knowledge", label: "Knowledge Graph", icon: Network }] },
  { label: "Platform", items: [
    { to: "/monitor", label: "System Monitor", icon: Zap },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
] as const;

const titles: Record<string, { title: string; crumb?: string }> = {
  "/": { title: "Home" }, "/ask-coach": { title: "Ask Coach", crumb: "Intelligence" },
  "/players": { title: "Player Analysis", crumb: "Intelligence" }, "/team": { title: "Team Analysis", crumb: "Intelligence" },
  "/scouting": { title: "Scouting", crumb: "Game preparation" }, "/pre-match": { title: "Pre-Match", crumb: "Game preparation" },
  "/post-match": { title: "Post-Match", crumb: "Game preparation" }, "/practice": { title: "Practice Planner", crumb: "Coaching" },
  "/knowledge": { title: "Knowledge Graph", crumb: "Explore" }, "/monitor": { title: "System Monitor", crumb: "Platform" },
  "/settings": { title: "Settings", crumb: "Platform" },
};

function Brand() {
  return <Link to="/" className="flex h-16 items-center gap-3 px-5" aria-label="XamCoach home">
    <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">X</span>
    <span className="text-[17px] font-bold tracking-tight">XamCoach</span>
  </Link>;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return <div className="flex h-full flex-col bg-sidebar">
    <Brand />
    <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
      {groups.map((group) => <div key={group.label} className="mb-5">
        <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{group.label}</p>
        <div className="space-y-0.5">{group.items.map((item) => {
          const Icon = item.icon;
          return <Link key={item.to} to={item.to} onClick={onNavigate}
            className="relative flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-secondary"
            activeProps={{ className: "nav-active" }}>
            <Icon className="size-4" strokeWidth={1.8}/><span>{item.label}</span>
          </Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-sidebar-border p-3">
      <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary">
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background">RG</span>
        <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">Romane Girard</span><span className="block text-[11px] text-muted-foreground">Head coach</span></span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
    </div>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const page = titles[pathname] ?? { title: "XamCoach" };
  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border lg:block"><SidebarContent /></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
      <button aria-label="Close navigation" className="absolute inset-0 bg-overlay" onClick={() => setMobileOpen(false)} />
      <aside className="relative h-full w-60 border-r border-sidebar-border shadow-overlay"><SidebarContent onNavigate={() => setMobileOpen(false)} /></aside>
    </div>}
    <div className="lg:pl-60">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-sm md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
          <div className="min-w-0">{page.crumb && <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{page.crumb}</p>}<h1 className="truncate text-[17px] font-semibold">{page.title}</h1></div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium sm:flex"><span className="size-1.5 rounded-full bg-success"/>AI Ready</span>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell/><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary"/></Button>
          <span className="grid size-8 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">RG</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
