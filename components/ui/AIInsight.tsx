import { ReactNode } from "react";
import { Card } from "./Card";
import { AIBadge } from "./AIBadge";
import { SourcePanel, type Source } from "./SourcePanel";
import { cn } from "@/lib/utils";

export function AIInsight({
  title,
  children,
  sources,
  className,
}: {
  title: string;
  children: ReactNode;
  sources?: Source[];
  className?: string;
}) {
  return (
    <Card className={cn("border-intelligence-border bg-intelligence p-5 shadow-none", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-text-primary">{title}</h3>
        <AIBadge />
      </div>
      <div className="mt-4 text-sm leading-6 text-text-secondary">{children}</div>
      <SourcePanel sources={sources} />
    </Card>
  );
}
