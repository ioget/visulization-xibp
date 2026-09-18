import { cn } from "@/lib/utils";

function BasketballGraphic({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
        <circle cx="24" cy="24" r="17" stroke="var(--color-orange)" strokeWidth="2" />
        <path
          d="M24 7v34M7 24h34M11 11c4.2 3.7 6.5 8 6.5 13s-2.3 9.3-6.5 13M37 11c-4.2 3.7-6.5 8-6.5 13s2.3 9.3 6.5 13"
          stroke="var(--color-orange)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CourtLines() {
  return (
    <svg
      viewBox="0 0 400 640"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      fill="none"
      aria-hidden="true"
    >
      <rect x="40" y="30" width="320" height="580" rx="2" stroke="white" strokeWidth="1.5" />
      <line x1="40" y1="320" x2="360" y2="320" stroke="white" strokeWidth="1.5" />
      <circle cx="200" cy="320" r="52" stroke="white" strokeWidth="1.5" />

      {/* Top key */}
      <rect x="150" y="30" width="100" height="90" stroke="white" strokeWidth="1.5" />
      <circle cx="200" cy="120" r="50" stroke="white" strokeWidth="1.5" />
      <path
        d="M64 30 V130 A162 162 0 0 0 336 130 V30"
        stroke="white"
        strokeWidth="1.5"
      />

      {/* Bottom key */}
      <rect x="150" y="520" width="100" height="90" stroke="white" strokeWidth="1.5" />
      <circle cx="200" cy="520" r="50" stroke="white" strokeWidth="1.5" />
      <path
        d="M64 610 V510 A162 162 0 0 1 336 510 V610"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BasketballPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[#0B1220] lg:flex lg:flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-orange) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-24 h-[420px] w-[420px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-blue) 0%, transparent 70%)" }}
      />

      <CourtLines />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
          XamCoach Intelligence
        </div>

        <div className="max-w-md">
          <BasketballGraphic className="mb-8 h-16 w-16" />
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-white">
            Coach smarter with real basketball intelligence.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            Scouting, game-planning and player analysis, unified in one workspace built for
            coaching staffs.
          </p>
          <p className="mt-8 text-xs text-white/35">Built for professional coaching staffs.</p>
        </div>
      </div>
    </div>
  );
}
