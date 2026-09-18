import { Sparkles } from "lucide-react";

export function AIBadge({ label = "AI-generated" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-intelligence-border bg-intelligence px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-blue-dark">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
