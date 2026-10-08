import type { Citation } from "./api-client";

/** Transient bridge for the "view all sources" flow: a coach answer's
 * citations are real, retrieved evidence (see llm/citation_builder.py) but
 * have no stable id of their own -- this stores exactly the set the coach
 * clicked through from, for app/dashboard/sources/page.tsx (opened in a
 * new tab) to read. localStorage, not sessionStorage: sessionStorage is
 * only copied into a new tab under the browser's own "auxiliary browsing
 * context with an opener" rules, which isn't reliable enough for this --
 * localStorage is shared across every tab of the same origin immediately,
 * no copy-on-open semantics to depend on. Overwritten by the next "view
 * sources" click, same one-slot contract as getOrCreateSessionId's own
 * storage usage. */
const KEY = "xamcoach-last-sources";

export interface StoredSources {
  question: string;
  citations: Citation[];
}

export function setLastSources(question: string, citations: Citation[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ question, citations } satisfies StoredSources));
  } catch {
    // Private window / blocked storage -- the "view sources" link still
    // navigates, the destination page just shows its own empty state.
  }
}

export function getLastSources(): StoredSources | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSources) : null;
  } catch {
    return null;
  }
}
