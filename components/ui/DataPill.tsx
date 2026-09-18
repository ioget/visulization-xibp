import { ReactNode } from "react";

export function DataPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-brand-blue/10 px-2 py-1 text-xs font-semibold tabular-nums text-brand-blue">
      {children}
    </span>
  );
}
