"use client";

import { useState } from "react";
import { ChevronDown, Database, ExternalLink } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface Source {
  name: string;
  detail: string;
}

const defaultSources: Source[] = [
  { name: "Game database", detail: "Toulouse vs Bourges · 14 Mar 2026" },
  { name: "Player statistics", detail: "Last 5 games" },
  { name: "Coaching knowledge", detail: "Spacing principles · Chapter 4" },
  { name: "Knowledge graph", detail: "Pick-and-roll → Weak-side rotation" },
];

export function SourcePanel({ sources = defaultSources }: { sources?: Source[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-intelligence-border pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-brand-blue hover:text-brand-blue-dark"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Database className="h-4 w-4" aria-hidden="true" />
        Sources · {sources.length}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-150 ease-out", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>
      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {sources.map((source) => (
            <div
              key={source.name}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-secondary p-3"
            >
              <div>
                <p className="text-xs font-semibold text-text-primary">{source.name}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{source.detail}</p>
              </div>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
