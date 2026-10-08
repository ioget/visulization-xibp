import type { CoachResponse } from "./api-client";

/** Persists Ask Coach's conversation across a route change (Next.js App
 * Router unmounts the page component, so plain React state is lost) and
 * across a refresh, in sessionStorage -- same one-tab-one-conversation
 * scope as getOrCreateSessionId's own session id, so the two stay
 * consistent with each other. */
const KEY = "xamcoach-ask-coach-turns";

export interface StoredTurn {
  question: string;
  response?: CoachResponse;
  error?: string;
}

export function loadTurns(): StoredTurn[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredTurn[]) : [];
  } catch {
    return [];
  }
}

export function saveTurns(turns: StoredTurn[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(turns));
  } catch {
    // Private window / blocked storage -- the conversation just won't
    // survive navigation this time, nothing else degrades.
  }
}
