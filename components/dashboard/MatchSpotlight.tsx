"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Shield, UserRound } from "lucide-react";
import { Spinner } from "@/components/ui";
import { fetchMatchupSpotlights, type MatchupSpotlight, type SpotlightTeam } from "@/lib/api-client";

function TeamBadge({ team, reverse }: { team: SpotlightTeam; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${reverse ? "flex-row-reverse" : ""}`}>
      {team.logo_base64 ? (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
        <img
          src={`data:image/png;base64,${team.logo_base64}`}
          alt={team.name}
          className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-1"
        />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/15 text-white">
          <Shield className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span className="text-sm font-bold text-white">{team.name}</span>
    </div>
  );
}

function PlayerPoster({ team, align }: { team: SpotlightTeam; align: "left" | "right" }) {
  const player = team.best_player;
  return (
    <div className={`flex flex-col items-center ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      {player?.photo_base64 ? (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
        <img
          src={`data:image/jpeg;base64,${player.photo_base64}`}
          alt={player.name}
          className="h-24 w-24 rounded-xl border-2 border-white/30 bg-white object-cover shadow-lg sm:h-28 sm:w-28"
        />
      ) : (
        <span className="grid h-24 w-24 place-items-center rounded-xl border-2 border-white/30 bg-white/10 text-white/70 sm:h-28 sm:w-28">
          <UserRound className="h-10 w-10" aria-hidden="true" />
        </span>
      )}
      <p className="mt-2 text-sm font-bold text-white">{player?.name ?? "Roster TBD"}</p>
      {player && <p className="text-[11px] text-white/70">{player.ppg} PPG</p>}
    </div>
  );
}

export function MatchSpotlight() {
  const [spotlights, setSpotlights] = useState<MatchupSpotlight[] | undefined>(undefined);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchMatchupSpotlights()
      .then(setSpotlights)
      .catch(() => setSpotlights([]));
  }, []);

  if (spotlights === undefined) {
    return (
      <div className="mx-[50px] flex h-full min-h-64 items-center justify-center rounded-2xl border border-border bg-surface">
        <Spinner size="md" />
      </div>
    );
  }

  if (spotlights.length === 0) return null;

  const spotlight = spotlights[index];
  const prev = () => setIndex((i) => (i - 1 + spotlights.length) % spotlights.length);
  const next = () => setIndex((i) => (i + 1) % spotlights.length);

  return (
    <div className="relative mx-[50px] min-h-64">
      {spotlights.length > 1 && (
        <>
          <div aria-hidden="true" className="absolute inset-x-5 top-3 bottom-[-6px] rounded-2xl bg-text-primary/15" />
          <div aria-hidden="true" className="absolute inset-x-3 top-1.5 bottom-[-3px] rounded-2xl bg-text-primary/25" />
        </>
      )}
      <div
        key={index}
        className="relative flex h-full min-h-64 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-brand-blue to-text-primary p-6 shadow-[0_14px_40px_rgba(15,23,42,0.18)] animate-[spotlight-card-in_350ms_ease-out]"
      >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-orange">Upcoming Match</p>
        {spotlight.scheduled_at && (
          <p className="text-xs font-bold text-white">
            {new Date(spotlight.scheduled_at).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <TeamBadge team={spotlight.home} />
        <span className="text-xs font-black text-white/50">VS</span>
        <TeamBadge team={spotlight.away} reverse />
      </div>

      <div className="mt-6 flex flex-1 items-center justify-between gap-4">
        <PlayerPoster team={spotlight.home} align="left" />
        <span className="shrink-0 text-2xl font-black text-white/30 sm:text-3xl">VS</span>
        <PlayerPoster team={spotlight.away} align="right" />
      </div>

      <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-wide text-white/60">
        Two teams. One battle. Be ready.
      </p>

      {spotlights.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous match"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white transition-colors duration-150 ease-out hover:bg-white/25"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex gap-1.5">
            {spotlights.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next match"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white transition-colors duration-150 ease-out hover:bg-white/25"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
