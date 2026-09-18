"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, X } from "lucide-react";
import { AskCoachConversation } from "./AskCoachConversation";

export function AskCoachWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/dashboard/ask-coach") return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Ask Coach"
          className="fixed bottom-23 right-4 z-50 flex h-[min(600px,calc(100vh-8rem))] w-[min(384px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_14px_40px_rgba(15,23,42,0.18)] sm:right-6"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-intelligence text-brand-blue">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">Ask Coach</p>
                <p className="text-[11px] text-text-secondary">Basketball intelligence</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-secondary hover:text-text-primary"
              aria-label="Close Ask Coach"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <AskCoachConversation variant="widget" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Ask Coach" : "Open Ask Coach"}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)] transition-transform duration-150 ease-out hover:scale-105 hover:bg-brand-orange-hover sm:right-6"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
