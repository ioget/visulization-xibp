"use client";

import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "./Button";

const offense: [string, string, string][] = [
  ["O1", "30%", "67%"],
  ["O2", "49%", "78%"],
  ["O3", "68%", "61%"],
];

const defense: [string, string, string][] = [
  ["X1", "38%", "42%"],
  ["X2", "61%", "40%"],
  ["X3", "75%", "69%"],
];

export function TacticalBoard() {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(1);

  const play = () => {
    setPlaying(true);
    setStep((s) => (s === 5 ? 1 : s + 1));
    window.setTimeout(() => setPlaying(false), 800);
  };

  return (
    <div>
      <div className="relative h-64 overflow-hidden rounded-xl border border-border bg-court">
        <svg viewBox="0 0 100 64" className="h-full w-full">
          <path
            d="M4 62V3h92v59M37 3a13 13 0 0 0 26 0M50 7v9M45 16h10M34 3v25h32V3M18 62a36 36 0 0 1 64 0"
            fill="none"
            stroke="var(--color-court-line)"
            strokeWidth={0.7}
          />
          <path
            d="M30 43Q48 30 66 40M51 52Q56 36 72 27"
            fill="none"
            stroke="var(--color-brand-orange)"
            strokeDasharray="2 2"
            strokeWidth={1}
          />
        </svg>
        {offense.map(([n, l, t], i) => (
          <span
            key={n}
            className={`absolute grid h-7 w-7 place-items-center rounded-full bg-brand-orange text-[9px] font-bold text-white shadow-sm transition-all duration-700 ${
              playing ? "translate-x-8 -translate-y-7" : ""
            }`}
            style={{ left: l, top: t, transitionDelay: `${i * 100}ms` }}
          >
            {n}
          </span>
        ))}
        {defense.map(([n, l, t], i) => (
          <span
            key={n}
            className={`absolute grid h-7 w-7 place-items-center rounded-full bg-brand-blue text-[9px] font-bold text-white shadow-sm transition-all duration-700 ${
              playing ? "translate-x-3 translate-y-2" : ""
            }`}
            style={{ left: l, top: t, transitionDelay: `${i * 80}ms` }}
          >
            {n}
          </span>
        ))}
        <span className="absolute left-3 top-3 rounded bg-text-primary px-2 py-1 text-[10px] font-bold text-white">
          HORNS 45
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={play}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Playing" : "Play"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setStep(1);
              setPlaying(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Replay
          </Button>
        </div>
        <span className="text-xs font-semibold tabular-nums text-text-secondary">{step} / 5</span>
      </div>
    </div>
  );
}
