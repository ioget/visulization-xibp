import { DataPill } from "@/components/ui";
import type { CoachResponse } from "@/lib/api-client";
import { CoachChartView } from "./CoachChartView";
import { MarkdownContent } from "./MarkdownContent";
import { SourcesList } from "./SourcesList";

/** The one place a full CoachResponse (llm/response_formatter.py::
 * CoachResponse.to_dict()) gets rendered -- summary, markdown-parsed
 * analysis, an optional native chart, recommendations, tactical board
 * badge, guardrail warnings and rich sources. Reused by Ask Coach, Player
 * Analysis' AI narrative, Team Analysis' tactics/squad reports and
 * Practice Planner's narrative/plan -- every one of those used to hand-roll
 * its own `whitespace-pre-wrap` version of this, which is exactly what
 * rendered a real markdown table as literal pipe characters. */
export function CoachAnswer({ question, response }: { question: string; response: CoachResponse }) {
  return (
    <div>
      {response.summary && <p className="text-sm italic text-text-primary">{response.summary}</p>}

      {response.analysis && !response.needs_clarification && (
        <div className="mt-3">
          <MarkdownContent>{response.analysis}</MarkdownContent>
        </div>
      )}

      {response.chart && <CoachChartView chart={response.chart} />}

      {response.recommendations.length > 0 && (
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          {response.recommendations.map((recommendation, index) => (
            <li key={index} className="flex gap-3">
              <b className="text-brand-blue">{String(index + 1).padStart(2, "0")}</b>
              <span>{recommendation}</span>
            </li>
          ))}
        </ol>
      )}

      {response.tactical_board && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Tactical board</p>
          <DataPill>{(response.tactical_board as { play?: { name?: string } }).play?.name ?? "Board available"}</DataPill>
        </div>
      )}

      {response.guardrail_warnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-text-muted">
          {response.guardrail_warnings.map((warning, i) => (
            <li key={i}>⚠️ {warning}</li>
          ))}
        </ul>
      )}

      <SourcesList question={question} sources={response.sources} />
    </div>
  );
}
