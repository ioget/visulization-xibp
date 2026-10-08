"use client";

import { useEffect, useState } from "react";
import { BookOpen, Database, ExternalLink, HeartPulse, Share2, Globe } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, EmptyState } from "@/components/ui";
import { getLastSources } from "@/lib/citation-store";
import type { Citation } from "@/lib/api-client";

const KIND_META: Record<Citation["kind"], { label: string; icon: typeof BookOpen }> = {
  book: { label: "Book excerpt", icon: BookOpen },
  web: { label: "Web search result", icon: Globe },
  statistics: { label: "Statistics query", icon: Database },
  health: { label: "Health / wearable data", icon: HeartPulse },
  graph: { label: "Knowledge graph", icon: Share2 },
};

function SourceCard({ citation }: { citation: Citation }) {
  const meta = KIND_META[citation.kind];
  const Icon = meta.icon;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-intelligence text-brand-blue">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-secondary">{meta.label}</p>
          <h3 className="text-sm font-bold text-text-primary">
            {citation.kind === "book" ? citation.book_title ?? "Untitled" : citation.kind === "web" ? citation.title ?? citation.url ?? "Untitled" : meta.label}
          </h3>
        </div>
        <span className="ml-auto rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold tabular-nums text-text-secondary">
          {Math.round(citation.confidence * 100)}% confidence
        </span>
      </div>

      {citation.kind === "book" && (
        <div className="mt-3 space-y-2 text-sm">
          {(citation.chapter || citation.page) && (
            <p className="text-xs text-text-secondary">
              {citation.chapter}
              {citation.chapter && citation.page ? " · " : ""}
              {citation.page ? `p. ${citation.page}` : ""}
            </p>
          )}
          <blockquote className="rounded-lg border-l-2 border-brand-blue bg-intelligence p-3 text-sm leading-6 text-text-primary">
            {citation.excerpt || citation.content_snippet}
          </blockquote>
        </div>
      )}

      {citation.kind === "web" && (
        <div className="mt-3 space-y-2 text-sm">
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue underline-offset-2 hover:underline"
            >
              {citation.url}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          <p className="rounded-lg bg-surface-secondary p-3 text-sm leading-6 text-text-primary">{citation.content_snippet}</p>
        </div>
      )}

      {(citation.kind === "statistics" || citation.kind === "health" || citation.kind === "graph") && (
        <div className="mt-3 space-y-2 text-sm">
          {citation.provenance && <p className="text-xs text-text-secondary">{citation.provenance}</p>}
          <p className="rounded-lg bg-surface-secondary p-3 text-sm leading-6 text-text-primary">{citation.content_snippet}</p>
        </div>
      )}
    </Card>
  );
}

export default function SourcesPage() {
  const [data, setData] = useState<{ question: string; citations: Citation[] } | null | undefined>(undefined);

  useEffect(() => {
    // localStorage is only readable client-side; hydrating here (rather
    // than a useState lazy initializer) avoids an SSR/client markup
    // mismatch on first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(getLastSources());
  }, []);

  return (
    <AppShell title="Sources" breadcrumb="Intelligence">
      <PageHeader
        title="Sources"
        description={data?.question ? `Every source behind the answer to: "${data.question}"` : "Every source behind a coach answer, in full."}
      />

      {data === undefined ? null : !data || data.citations.length === 0 ? (
        <EmptyState
          icon={<Database className="h-6 w-6" aria-hidden="true" />}
          title="No sources to show yet"
          description='Ask a question anywhere in the app, then select "View full sources" under its answer.'
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.citations.map((citation, i) => (
            <SourceCard key={i} citation={citation} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
