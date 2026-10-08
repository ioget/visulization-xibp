import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** The one loading indicator every async action in the app uses -- a
 * continuously spinning circle, shown until the data/response it's
 * waiting on arrives. `size` covers the two real use cases: inline inside
 * a button ("sm", replacing an icon) and a standalone block/section
 * loading state ("md", optionally next to a label). */
export function Spinner({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <Loader2
      className={cn("animate-spin text-current", size === "sm" ? "h-4 w-4" : "h-6 w-6", className)}
      aria-hidden="true"
    />
  );
}

export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
      <Spinner size="md" />
      {label && <span>{label}</span>}
    </div>
  );
}
