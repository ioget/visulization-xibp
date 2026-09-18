"use client";

import { useState } from "react";
import { ArrowUp, Bot, Check, Search } from "lucide-react";
import { AIInsight, Button, Card, DataPill, TacticalBoard } from "@/components/ui";
import { cn } from "@/lib/utils";

const suggestions = [
  "How should we attack Lyon's drop coverage?",
  "Who is trending up over the last five games?",
  "Build a late-game sideline action",
];

export function AskCoachConversation({ variant = "page" }: { variant?: "page" | "widget" }) {
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(true);

  const submit = () => {
    if (query.trim()) {
      setSent(true);
      setQuery("");
    }
  };

  const isWidget = variant === "widget";

  return (
    <div className={cn(isWidget && "flex min-h-0 flex-1 flex-col")}>
      <div className={cn(isWidget && "min-h-0 flex-1 space-y-4 overflow-y-auto p-4")}>
        {!sent ? (
          <Card className={cn("text-center", isWidget ? "p-6" : "p-8")}>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-intelligence text-brand-blue">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-text-primary">What do you want to understand?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Ask about performance, opponents, lineups, or tactical concepts.
            </p>
          </Card>
        ) : (
          <div className={cn(isWidget ? "space-y-4" : "space-y-5")}>
            <div className="flex justify-end">
              <div className="max-w-xl rounded-xl rounded-br-sm bg-text-primary px-4 py-3 text-sm text-white">
                How should we attack Lyon&apos;s drop coverage in Saturday&apos;s game?
              </div>
            </div>

            <AIInsight title="Recommended approach">
              <p>
                Lyon&apos;s center retreats below the foul line on 62% of ball screens. Create an early
                advantage by lifting the weak-side wing and forcing the low defender to choose.
              </p>
              <ol className="mt-3 space-y-2">
                <li className="flex gap-3">
                  <b className="text-brand-blue">01</b>
                  <span>Use Fauthoux–Rupert high pick-and-roll to pull the drop defender above the nail.</span>
                </li>
                <li className="flex gap-3">
                  <b className="text-brand-blue">02</b>
                  <span>
                    Station Johannès one pass away; Lyon concedes <strong>38.1%</strong> from the weak-side
                    corner.
                  </span>
                </li>
                <li className="flex gap-3">
                  <b className="text-brand-blue">03</b>
                  <span>If the low defender tags, hit the short roll and play the 4-on-3.</span>
                </li>
              </ol>
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">
                  Key verified numbers
                </p>
                <div className="flex flex-wrap gap-2">
                  <DataPill>62% drop coverage</DataPill>
                  <DataPill>38.1% weak-side 3P</DataPill>
                  <DataPill>1.12 PPP short roll</DataPill>
                </div>
              </div>
            </AIInsight>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">Horns 45 · Weak-side lift</p>
                  <p className="text-xs text-text-secondary">Tactical sequence generated from the briefing</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  5 actions
                </span>
              </div>
              <TacticalBoard />
            </Card>
          </div>
        )}
      </div>

      <div
        className={cn(
          isWidget
            ? "shrink-0 border-t border-border bg-surface p-2"
            : "sticky bottom-4 mt-6 rounded-xl border border-border bg-surface p-2 shadow-[0_14px_40px_rgba(15,23,42,0.14)]",
        )}
      >
        <div className="flex items-end gap-2">
          <Search className="mb-2.5 ml-2 h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about your team..."
            rows={1}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary"
          />
          <Button type="button" size="icon" onClick={submit} aria-label="Send question">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-2", isWidget ? "shrink-0 px-4 py-3" : "mt-3")}>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors duration-150 ease-out hover:border-brand-orange/40 hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
