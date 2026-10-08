"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUp, Bot, Globe } from "lucide-react";
import { AIInsight, Button, Card, LogoMark } from "@/components/ui";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import { cn } from "@/lib/utils";
import { askCoach, getOrCreateSessionId, ApiError } from "@/lib/api-client";
import { loadTurns, saveTurns, type StoredTurn } from "@/lib/ask-coach-store";
import { logActivity } from "@/lib/activity-log";

const suggestions = [
  "How should we attack Lyon's drop coverage?",
  "Who is trending up over the last five games?",
  "What are the team stats for Toulouse this season?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className="h-8 w-8 animate-bounce" />
      <div className="flex items-center gap-1 rounded-full bg-intelligence px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-blue"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function CoachTurn({ turn }: { turn: StoredTurn }) {
  const { response, error } = turn;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="max-w-xl rounded-xl rounded-br-sm bg-text-primary px-4 py-3 text-sm text-white">
          {turn.question}
        </div>
      </div>

      {error ? (
        <Card className="flex items-start gap-3 border-danger/30 bg-danger/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm text-text-primary">{error}</p>
        </Card>
      ) : response ? (
        <AIInsight title={response.needs_clarification ? "One quick question" : "XamCoach"}>
          <CoachAnswer question={turn.question} response={response} />
        </AIInsight>
      ) : null}
    </div>
  );
}

export function AskCoachConversation({ variant = "page" }: { variant?: "page" | "widget" }) {
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<StoredTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  useEffect(() => {
    // sessionStorage is only readable client-side; hydrating here (rather
    // than a useState lazy initializer) avoids an SSR/client markup
    // mismatch on first paint. Saving happens explicitly at each point
    // `turns` actually changes below (submit()), never via a reactive
    // effect on `turns` -- that used to fire once more right after this
    // hydration, in the same commit, still closing over the pre-hydration
    // empty array, and clobbered the just-loaded conversation with `[]`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTurns(loadTurns());
  }, []);

  const isWidget = variant === "widget";

  const submit = async () => {
    const question = query.trim();
    if (!question || pending) return;

    setQuery("");
    setPending(true);
    const withQuestion = [...turns, { question }];
    setTurns(withQuestion);
    saveTurns(withQuestion);

    try {
      const response = await askCoach({
        question,
        session_id: getOrCreateSessionId(),
        web_search_enabled: webSearchEnabled,
      });
      const withResponse = withQuestion.map((turn, index) => (index === withQuestion.length - 1 ? { ...turn, response } : turn));
      setTurns(withResponse);
      saveTurns(withResponse);
      logActivity("Asked Ask Coach", question.length > 100 ? `${question.slice(0, 100)}…` : question);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `The coach backend returned an error (${error.status}). Is the API running on ${
              process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
            }?`
          : "Could not reach the coach backend. Is the API server running?";
      const withError = withQuestion.map((turn, index) => (index === withQuestion.length - 1 ? { ...turn, error: message } : turn));
      setTurns(withError);
      saveTurns(withError);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn(isWidget && "flex min-h-0 flex-1 flex-col")}>
      <div className={cn(isWidget && "min-h-0 flex-1 space-y-4 overflow-y-auto p-4")}>
        {turns.length === 0 ? (
          <Card className={cn("text-center", isWidget ? "p-6" : "p-8")}>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-intelligence text-brand-blue">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-text-primary">What do you want to understand?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Ask about performance, opponents, lineups, or tactical concepts.
            </p>
          </Card>
        ) : (
          <div className={cn(isWidget ? "space-y-4" : "space-y-5")}>
            {turns.map((turn, index) => (
              <CoachTurn key={index} turn={turn} />
            ))}
            {pending && <TypingIndicator />}
          </div>
        )}
      </div>

      <div
        className={cn(
          isWidget
            ? "shrink-0 border-t border-border bg-surface p-2"
            : "sticky bottom-4 mt-6 rounded-xl border border-border bg-surface p-2 shadow-[0_14px_40px_rgba(15,23,42,0.14)]",
        )}
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Ask about your team..."
          rows={1}
          disabled={pending}
          className="max-h-28 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-2 px-1 pb-0.5 pt-1">
          <button
            type="button"
            onClick={() => setWebSearchEnabled((v) => !v)}
            aria-pressed={webSearchEnabled}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ease-out",
              webSearchEnabled
                ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-border text-text-secondary hover:bg-surface-secondary",
            )}
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            Web search
            <span
              className={cn(
                "ml-0.5 h-3.5 w-6 rounded-full transition-colors duration-150",
                webSearchEnabled ? "bg-brand-blue" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-150",
                  webSearchEnabled && "translate-x-2.5",
                )}
              />
            </span>
          </button>
          <Button type="button" size="icon" onClick={() => void submit()} disabled={pending} aria-label="Send question">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {!isWidget && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors duration-150 ease-out hover:border-brand-orange/40 hover:text-text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
