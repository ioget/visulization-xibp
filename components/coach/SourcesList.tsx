"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChevronDown, Database, ExternalLink, Globe, HeartPulse, Share2 } from "lucide-react";
import { Button } from "@/components/ui";
import { setLastSources } from "@/lib/citation-store";
import type { Citation } from "@/lib/api-client";

const KIND_ICON: Record<Citation["kind"], typeof BookOpen> = {
  book: BookOpen,
  web: Globe,
  statistics: Database,
  health: HeartPulse,
  graph: Share2,
};

export function sourceLabel(citation: Citation): string {
  if (citation.kind === "book") return citation.book_title ?? "Book";
  if (citation.kind === "web") return citation.title ?? "Web result";
  if (citation.kind === "graph") return "Knowledge graph";
  if (citation.kind === "health") return "Health data";
  return "Statistics";
}

export function sourceDetail(citation: Citation): string {
  if (citation.kind === "book") return citation.chapter ?? citation.page ?? "";
  if (citation.kind === "web") return citation.url ?? "";
  return citation.content_snippet.slice(0, 90);
}

/** Rich, kind-aware sources footer for a coach answer -- replaces the
 * generic name/detail SourcePanel for citation-shaped data, since a
 * Citation (llm/citation_builder.py) carries real per-kind fields
 * (book_title/chapter/page/excerpt, web title/url) a plain {name, detail}
 * pair throws away. "View full sources" hands this exact answer's
 * citations to the Sources page via localStorage (see
 * lib/citation-store.ts) rather than re-deriving them from nothing. */
export function SourcesList({ question, sources }: { question: string; sources: Citation[] }) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-intelligence-border pt-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 text-brand-blue hover:text-brand-blue-dark"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <Database className="h-4 w-4" aria-hidden="true" />
          Sources · {sources.length}
          <ChevronDown className={`h-4 w-4 transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>
        <Link
          href="/dashboard/sources"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setLastSources(question, sources)}
          className="text-xs font-semibold text-brand-blue underline-offset-2 hover:underline"
        >
          View full sources →
        </Link>
      </div>
      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {sources.map((s, i) => {
            const Icon = KIND_ICON[s.kind];
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface-secondary p-3">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-primary">{sourceLabel(s)}</p>
                  <p className="mt-0.5 truncate text-[11px] text-text-secondary">{sourceDetail(s)}</p>
                </div>
                {s.kind === "web" && s.url && <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
