import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const shots: Array<[number, number, number]> = [
  [49,75,1],[55,70,1],[43,72,0],[34,64,1],[66,61,0],[26,49,1],[77,52,0],[20,31,1],[84,35,1],[50,45,0],[38,38,1],[62,35,1],[13,17,0],[89,20,1],[49,22,1],[32,24,0],[69,23,1]
];
export function ShotChart({ compact = false }: { compact?: boolean }) {
  return <div className={`relative overflow-hidden rounded-xl border border-border bg-court ${compact ? "h-52" : "h-72"}`} aria-label="Half-court shot chart">
    <svg viewBox="0 0 100 70" className="h-full w-full" role="img" aria-label="Made and missed shot locations">
      <path d="M5 68V4h90v64M39 4a11 11 0 0 0 22 0M50 7v8M46 15h8M35 4v23h30V4M20 68a34 34 0 0 1 60 0" fill="none" stroke="var(--court-line)" strokeWidth=".7"/>
      {shots.map(([x,y,made],i) => made ? <circle key={i} cx={x} cy={y} r="1.6" fill="var(--success)" stroke="var(--surface)" strokeWidth=".6"/> : <g key={i} stroke="var(--critical)" strokeWidth="1"><path d={`M${x-1.5} ${y-1.5}l3 3M${x+1.5} ${y-1.5}l-3 3`}/></g>)}
    </svg>
    <div className="absolute bottom-3 left-3 flex gap-3 rounded-md border border-border bg-surface/90 px-2.5 py-1.5 text-[10px]"><span className="flex items-center gap-1"><i className="size-2 rounded-full bg-success"/>Made</span><span className="flex items-center gap-1"><i className="size-2 rounded-full bg-critical"/>Missed</span></div>
  </div>;
}

export function MiniTrend({ values = [42,48,45,56,53,61,58,66,64] }: { values?: number[] }) {
  const points = values.map((v,i) => `${i * (100/(values.length-1))},${75-v}`).join(" ");
  return <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-32 w-full" aria-label="Performance trend"><path d="M0 34H100M0 20H100M0 6H100" stroke="var(--border)" strokeWidth=".5"/><polyline points={points} fill="none" stroke="var(--data)" strokeWidth="2" vectorEffect="non-scaling-stroke"/><polyline points={`0,40 ${points} 100,40`} fill="var(--data-area)" stroke="none"/></svg>;
}

export function GameFlow() {
  return <div className="relative"><MiniTrend values={[18,26,22,34,38,42,47,52,58,62,65,69,74]}/><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Q1</span><span>Q2</span><span>Q3</span><span>FINAL</span></div></div>;
}

export function TacticalBoard() {
  const [playing,setPlaying] = useState(false); const [step,setStep] = useState(1);
  const play = () => { setPlaying(true); setStep((s) => s === 5 ? 1 : s+1); window.setTimeout(() => setPlaying(false), 800); };
  return <div><div className="relative h-64 overflow-hidden rounded-xl border border-border bg-court">
    <svg viewBox="0 0 100 64" className="h-full w-full"><path d="M4 62V3h92v59M37 3a13 13 0 0 0 26 0M50 7v9M45 16h10M34 3v25h32V3M18 62a36 36 0 0 1 64 0" fill="none" stroke="var(--court-line)" strokeWidth=".7"/>
    <path d="M30 43Q48 30 66 40M51 52Q56 36 72 27" fill="none" stroke="var(--primary)" strokeDasharray="2 2" strokeWidth="1"/>
    </svg>
    {[['O1','30%','67%'],['O2','49%','78%'],['O3','68%','61%']].map(([n,l,t],i)=><span key={n} className={`absolute grid size-7 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm transition-all duration-700 ${playing ? "translate-x-8 -translate-y-7" : ""}`} style={{left:l,top:t,transitionDelay:`${i*100}ms`}}>{n}</span>)}
    {[['X1','38%','42%'],['X2','61%','40%'],['X3','75%','69%']].map(([n,l,t],i)=><span key={n} className={`absolute grid size-7 place-items-center rounded-full bg-data text-[9px] font-bold text-data-foreground shadow-sm transition-all duration-700 ${playing ? "translate-x-3 translate-y-2" : ""}`} style={{left:l,top:t,transitionDelay:`${i*80}ms`}}>{n}</span>)}
    <span className="absolute left-3 top-3 rounded bg-foreground px-2 py-1 text-[10px] font-bold text-background">HORNS 45</span>
  </div><div className="mt-3 flex items-center justify-between"><div className="flex gap-2"><Button size="sm" onClick={play}>{playing ? <Pause/> : <Play/>}{playing ? "Playing" : "Play"}</Button><Button size="sm" variant="outline" onClick={() => {setStep(1);setPlaying(false)}}><RotateCcw/>Replay</Button></div><span className="text-xs font-semibold tabular-nums text-muted-foreground">{step} / 5</span></div></div>;
}
