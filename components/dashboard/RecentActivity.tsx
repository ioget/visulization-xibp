"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeading } from "@/components/ui";
import { formatActivityTime, getActivityLog, type ActivityEntry } from "@/lib/activity-log";

export function RecentActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    // localStorage is only readable client-side; hydrating here (rather
    // than a useState lazy initializer) avoids an SSR/client markup
    // mismatch on first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getActivityLog());
  }, []);

  return (
    <Card>
      <div className="border-b border-border p-5">
        <SectionHeading title="Recent activity" />
      </div>
      {entries.length === 0 ? (
        <p className="px-5 py-6 text-xs text-text-secondary">
          Nothing yet - reports you generate and questions you ask will show up here.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-3 px-5 py-3.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text-primary">{entry.title}</p>
                {entry.detail && <p className="mt-0.5 truncate text-[11px] text-text-secondary">{entry.detail}</p>}
                <p className="mt-0.5 text-[11px] text-text-muted">{formatActivityTime(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
