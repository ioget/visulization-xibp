"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, TrendingDown, TrendingUp, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, MetricCard, Select, ShotChart, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import { CoachChartView } from "@/components/coach/CoachChartView";
import { PercentileRadar } from "@/components/coach/PercentileRadar";
import {
  ApiError,
  fetchPlayerProfile,
  fetchPlayers,
  generatePlayerNarrative,
  type CoachResponse,
  type PlayerProfileResponse,
  type ScoutingPlayer,
} from "@/lib/api-client";

const TABS = ["Overview", "Statistics", "Shot Chart", "Health", "Recommendations"] as const;
type Tab = (typeof TABS)[number];

function DirectionIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "flat") return null;
  const Icon = direction === "up" ? TrendingUp : TrendingDown;
  return <Icon className={`h-3.5 w-3.5 ${direction === "up" ? "text-success" : "text-error"}`} aria-hidden="true" />;
}

export default function PlayerAnalysisPage() {
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState<ScoutingPlayer[]>([]);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  const [profile, setProfile] = useState<PlayerProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  const [chosenArea, setChosenArea] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<CoachResponse | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  const selectPlayer = (id: number) => {
    setPlayerId(id);
    setProfile(null);
    setProfileError(null);
    setNarrative(null);
    setNarrativeError(null);
    setTab("Overview");
    setLoadingProfile(true);
    fetchPlayerProfile(id)
      .then((data) => {
        setProfile(data);
        setChosenArea(data.priorities.weaknesses[0]?.area ?? null);
      })
      .catch(() => setProfileError("Could not load this player's profile. Is the API server running?"))
      .finally(() => setLoadingProfile(false));
  };

  useEffect(() => {
    const requestedId = Number(searchParams.get("player"));
    fetchPlayers()
      .then((list) => {
        setPlayers(list);
        const initial = (requestedId && list.find((p) => p.id === requestedId)?.id) || list[0]?.id;
        if (initial) selectPlayer(initial);
      })
      .catch(() => setPlayersError("Could not load the player list. Is the API server running?"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only ever read once, on mount
  }, []);

  const chosenPlan = useMemo(
    () => (chosenArea && profile ? profile.improvement_plans[chosenArea] : null),
    [chosenArea, profile],
  );

  const gameProgressionChart = useMemo(() => {
    if (!profile || profile.game_log.length < 2) return null;
    const chronological = [...profile.game_log].reverse();
    return {
      type: "line" as const,
      title: "Game-by-game progression",
      x_labels: chronological.map((g) => g.opponent || g.date || ""),
      series: [
        { name: "Points", values: chronological.map((g) => g.points) },
        { name: "Rebounds", values: chronological.map((g) => g.rebounds) },
        { name: "Assists", values: chronological.map((g) => g.assists) },
        { name: "Eval", values: chronological.map((g) => g.eval_rating) },
      ],
    };
  }, [profile]);

  const requestNarrative = async () => {
    if (playerId == null) return;
    setNarrativeLoading(true);
    setNarrativeError(null);
    try {
      const data = await generatePlayerNarrative(playerId, chosenArea);
      setNarrative(data);
      logActivity("AI coaching narrative generated", profile ? `${profile.player.first_name} ${profile.player.last_name}` : undefined);
    } catch (err) {
      setNarrativeError(
        err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.",
      );
    } finally {
      setNarrativeLoading(false);
    }
  };

  return (
    <AppShell title="Players" breadcrumb="Intelligence">
      <PageHeader
        title="Player Analysis"
        description="Select a player to explore their season profile, shooting tendencies and development priorities."
      />

      <Card className="mb-6 p-5">
        {playersError ? (
          <p className="text-sm text-error">{playersError}</p>
        ) : (
          <Select label="Player" value={playerId ?? ""} onChange={(e) => selectPlayer(Number(e.target.value))}>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} {p.position ? `(${p.position})` : ""}
              </option>
            ))}
          </Select>
        )}
      </Card>

      {profileError && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {profileError}
        </div>
      )}

      {loadingProfile && (
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <Spinner /> Loading player profile…
        </p>
      )}

      {profile && (
        <>
          <Card className="mb-6 overflow-hidden">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              {profile.player.photo_base64 ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
                <img
                  src={`data:image/jpeg;base64,${profile.player.photo_base64}`}
                  alt={`${profile.player.first_name} ${profile.player.last_name}`}
                  className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover"
                />
              ) : (
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-surface-secondary text-text-secondary">
                  <UserRound className="h-9 w-9" aria-hidden="true" />
                </span>
              )}
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-blue">
                  {profile.player.position ?? "N/A"} · {profile.player.team_name ?? "Team unknown"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-text-primary">
                  {profile.player.first_name} {profile.player.last_name}
                </h2>
                {profile.trend && <p className="mt-1 text-xs text-text-secondary">{profile.trend.content}</p>}
              </div>
            </div>
            <div className="border-t border-border p-5">
              <h3 className="mb-2 text-sm font-bold text-text-primary">Player Info</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(profile.identity_info).map(([field, value]) => (
                    <tr key={field} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                      <td className="py-2 pr-4 font-semibold text-text-primary">{field}</td>
                      <td className="py-2 text-text-secondary">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                  tab === t ? "bg-brand-blue text-white" : "text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="text-sm font-bold text-text-primary">Form study · last {profile.form.games_analyzed} games</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  {profile.form.form_label} · {profile.form.consistency_label}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.form.trends.map((t) => (
                    <div key={t.metric} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                      <span className="capitalize text-text-secondary">{t.metric.replace(/_/g, " ")}</span>
                      <span className="flex items-center gap-1.5 font-bold tabular-nums text-text-primary">
                        {t.window_avg}
                        <DirectionIcon direction={t.direction} />
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {profile.percentile && (
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-text-primary">Skill profile (percentile vs. league)</h3>
                  <PercentileRadar percentile={profile.percentile} />
                </Card>
              )}

              {profile.shooting_splits && (
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-text-primary">Shooting splits (season)</h3>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <MetricCard label="FG%" value={`${profile.shooting_splits.fg.pct}%`} detail={`${profile.shooting_splits.fg.made}/${profile.shooting_splits.fg.attempted}`} />
                    <MetricCard label="3P%" value={`${profile.shooting_splits.three_p.pct}%`} detail={`${profile.shooting_splits.three_p.made}/${profile.shooting_splits.three_p.attempted}`} />
                    <MetricCard label="FT%" value={`${profile.shooting_splits.ft.pct}%`} detail={`${profile.shooting_splits.ft.made}/${profile.shooting_splits.ft.attempted}`} />
                  </div>
                </Card>
              )}

              {profile.points_trend && (
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-text-primary">Points per game</h3>
                  <CoachChartView
                    chart={{
                      type: "line",
                      title: "Points per game",
                      x_labels: profile.points_trend.games.map((g) => g.opponent ?? g.date ?? ""),
                      series: [{ name: "Points", values: profile.points_trend.games.map((g) => g.points) }],
                    }}
                  />
                  <p className="mt-1 text-[11px] text-text-secondary">Season average: {profile.points_trend.season_avg} pts</p>
                </Card>
              )}

              {profile.pattern_evidence && (
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-text-primary">Event-based play profile</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetricCard label="Transition scoring" value={`${Math.round(Number(profile.pattern_evidence.data.transition_reliance) * 100)}%`} />
                    <MetricCard label="Paint scoring" value={`${Math.round(Number(profile.pattern_evidence.data.paint_scoring_reliance) * 100)}%`} />
                    <MetricCard label="3PT volume" value={`${Math.round(Number(profile.pattern_evidence.data.three_point_volume) * 100)}%`} />
                    <MetricCard label="Turnover rate" value={`${Math.round(Number(profile.pattern_evidence.data.turnover_rate) * 100)}%`} />
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">{profile.pattern_evidence.content}</p>
                </Card>
              )}
            </div>
          )}

          {tab === "Statistics" && (
            <Card className="p-5">
              {profile.aggregate && <p className="text-sm font-semibold text-text-primary">{profile.aggregate.content}</p>}
              {gameProgressionChart && <CoachChartView chart={gameProgressionChart} />}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase text-text-secondary">
                      {["Date", "Opp", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TO", "+/-", "EVAL"].map((h) => (
                        <th key={h} className="py-2 pr-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.game_log.map((g, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 pr-3">{g.date}</td>
                        <td className="py-2 pr-3">{g.opponent}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.minutes}</td>
                        <td className="py-2 pr-3 font-bold tabular-nums text-text-primary">{g.points}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.rebounds}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.assists}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.steals}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.blocks}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.turnovers}</td>
                        <td className="py-2 pr-3 tabular-nums">{g.plus_minus}</td>
                        <td className="py-2 pr-3 tabular-nums font-bold text-brand-blue">{g.eval_rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "Shot Chart" && (
            <Card className="p-4">
              <ShotChart shots={profile.shots} />
            </Card>
          )}

          {tab === "Health" && (
            <Card className="p-5">
              {profile.health ? (
                <>
                  <p className="text-sm text-text-primary">{profile.health.content}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MetricCard label="Fatigue" value={String(profile.health.data.fatigue_level ?? "-")} />
                    <MetricCard label="Recovery" value={String(profile.health.data.recovery_level ?? "-")} />
                    <MetricCard label="Injury risk" value={String(profile.health.data.injury_risk_level ?? "-")} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-secondary">No health/wearable data available for this player.</p>
              )}
            </Card>
          )}


          {tab === "Recommendations" && (
            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="text-sm font-bold text-text-primary">Data-driven priorities</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Deterministic - computed directly from real statistics, before any LLM is involved.
                </p>
                {profile.priorities.weaknesses.length === 0 ? (
                  <p className="mt-3 text-sm text-text-secondary">No statistically notable weakness detected.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {profile.priorities.weaknesses.map((w) => (
                      <button
                        key={w.area}
                        type="button"
                        onClick={() => {
                          setChosenArea(w.area);
                          setNarrative(null);
                        }}
                        className={`w-full rounded-lg border p-3 text-left text-sm transition-colors duration-150 ${
                          chosenArea === w.area ? "border-brand-blue bg-brand-blue/5" : "border-border hover:bg-surface-secondary"
                        }`}
                      >
                        <p className="font-bold text-text-primary">{w.area}</p>
                        <p className="mt-1 text-xs text-text-secondary">{w.reason}</p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {chosenPlan && (
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-text-primary">Improvement plan · {chosenPlan.objective}</h3>
                  <p className="mt-1 text-xs text-text-secondary">{chosenPlan.why}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <MetricCard label="Baseline" value={chosenPlan.baseline} />
                    <MetricCard label="Target" value={chosenPlan.target} />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary">Actions</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-text-primary">
                      {chosenPlan.actions.map((a, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-brand-blue">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">Evaluation period: {chosenPlan.evaluation_period}</p>
                </Card>
              )}

              <Card className="border-intelligence-border bg-intelligence p-5">
                <h3 className="text-sm font-bold text-text-primary">AI coaching narrative (optional)</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Generated by the Supervisor Agent + Coach Chain. Adds explanation on top of the plan above; not required to use it.
                </p>
                {!profile.priorities.has_sufficient_data ? (
                  <p className="mt-3 text-sm text-text-secondary">
                    Not enough recorded games yet for a reliable recommendation. {profile.priorities.insufficient_data_reason}
                  </p>
                ) : (
                  <Button type="button" className="mt-3" onClick={() => void requestNarrative()} disabled={narrativeLoading}>
                    {narrativeLoading ? <Spinner /> : null}
                    Add AI coaching narrative
                  </Button>
                )}
                {narrativeError && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {narrativeError}
                  </div>
                )}
                {narrative && (
                  <div className="mt-4 rounded-lg bg-surface p-4">
                    <CoachAnswer
                      question={`AI coaching narrative for ${profile.player.first_name} ${profile.player.last_name}`}
                      response={narrative}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
