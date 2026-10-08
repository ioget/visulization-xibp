/** A real, local log of actions the coach actually took in this browser
 * (report generated, plan built, question asked) -- there is no backend
 * activity table, so this is intentionally client-only (localStorage, not
 * sessionStorage: unlike the per-tab stores in citation-store.ts/
 * ask-coach-store.ts, "recent activity" should survive closing the tab).
 * Every entry here is written from a real completed action -- never
 * fabricated, unlike the dashboard's old static placeholder list. */
const KEY = "xamcoach-activity-log";
const MAX_ENTRIES = 20;

export interface ActivityEntry {
  title: string;
  detail?: string;
  timestamp: number;
}

export function logActivity(title: string, detail?: string): void {
  try {
    const entries = getActivityLog();
    entries.unshift({ title, detail, timestamp: Date.now() });
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Private window / blocked storage -- the action itself already
    // succeeded, losing its log entry isn't worth surfacing an error for.
  }
}

export function getActivityLog(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

export function formatActivityTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Today, ${time}` : `${date.toLocaleDateString()}, ${time}`;
}
