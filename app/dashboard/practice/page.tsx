"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, Button, Card, EmptyState, Select, SectionHeading, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import {
  ApiError,
  fetchPlayerProfile,
  fetchPlayers,
  fetchTeamPriorities,
  fetchTeams,
  generatePlayerPracticePlan,
  generateTeamPracticeNarrative,
  generateTeamSession,
  type CoachResponse,
  type ImprovementPriority,
  type PlayerProfileResponse,
  type PreMatchTeam,
  type ScoutingPlayer,
  type TeamPrioritiesResponse,
  type TeamSessionResponse,
} from "@/lib/api-client";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
const SESSION_TYPES = ["Maintenance", "Game preparation", "Tactical execution", "Team cohesion"];
const CUSTOM_GOAL_OPTION = "Custom goal…";

function TrainingSessionView({ session }: { session: TeamSessionResponse["training_session"] }) {
  if (!session) return null;
  const startTimes: number[] = [];
  session.blocks.reduce((elapsed, block) => {
    startTimes.push(elapsed);
    return elapsed + block.duration_minutes;
  }, 0);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <SectionHeading
          title={session.primary_objective}
          description={`${session.total_duration_minutes} min${session.secondary_objective ? ` · also: ${session.secondary_objective}` : ""}`}
        />
        <AIBadge />
      </div>
      <p className="text-xs text-text-secondary">{session.primary_rationale}</p>
      <div className="mt-4">
        {session.blocks.map((block, i) => {
          const time = startTimes[i];
          const h = String(Math.floor(time / 60)).padStart(2, "0");
          const m = String(time % 60).padStart(2, "0");
          return (
            <div key={i} className="grid grid-cols-[54px_20px_1fr_auto] gap-3">
              <span className="pt-3 text-xs font-bold tabular-nums text-brand-blue">
                {h}:{m}
              </span>
              <div className="flex flex-col items-center">
                <span className="mt-3 h-2.5 w-2.5 rounded-full bg-brand-blue" />
                {i < session.blocks.length - 1 && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className="border-b border-border py-3">
                <p className="text-sm font-semibold text-text-primary">{block.label}</p>
                {block.organization && <p className="mt-1 text-xs text-text-secondary">{block.organization}</p>}
                {block.coaching_points && block.coaching_points.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {block.coaching_points.map((cp, j) => (
                      <li key={j} className="text-[11px] text-text-secondary">
                        • {cp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="py-3 text-xs font-semibold tabular-nums text-text-secondary">{block.duration_minutes} min</span>
            </div>
          );
        })}
      </div>
      {session.metrics_to_monitor.length > 0 && (
        <p className="mt-3 text-[11px] text-text-secondary">Track next game: {session.metrics_to_monitor.join(", ")}</p>
      )}
    </Card>
  );
}

export default function PracticePlannerPage() {
  const [mode, setMode] = useState<"team" | "player">("team");

  // Team mode state
  const [teams, setTeams] = useState<PreMatchTeam[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teamPriorities, setTeamPriorities] = useState<TeamPrioritiesResponse | null>(null);
  const [loadingTeamPriorities, setLoadingTeamPriorities] = useState(false);
  const [primaryArea, setPrimaryArea] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<string>(SESSION_TYPES[0]);
  const [teamCustomGoal, setTeamCustomGoal] = useState("");
  const [teamDuration, setTeamDuration] = useState(60);
  const [teamDifficulty, setTeamDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Intermediate");
  const [teamSession, setTeamSession] = useState<TeamSessionResponse | null>(null);
  const [teamSessionLoading, setTeamSessionLoading] = useState(false);
  const [teamNarrative, setTeamNarrative] = useState<CoachResponse | null>(null);
  const [teamNarrativeLoading, setTeamNarrativeLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Player mode state
  const [players, setPlayers] = useState<ScoutingPlayer[]>([]);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfileResponse | null>(null);
  const [loadingPlayerProfile, setLoadingPlayerProfile] = useState(false);
  const [chosenGoal, setChosenGoal] = useState<string | null>(null);
  const [customGoalText, setCustomGoalText] = useState("");
  const [playerInstructions, setPlayerInstructions] = useState("");
  const [playerDuration, setPlayerDuration] = useState(60);
  const [playerDifficulty, setPlayerDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Intermediate");
  const [playerPlan, setPlayerPlan] = useState<CoachResponse | null>(null);
  const [playerPlanLoading, setPlayerPlanLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const selectTeam = (id: number) => {
    setTeamId(id);
    setTeamPriorities(null);
    setPrimaryArea(null);
    setTeamSession(null);
    setTeamNarrative(null);
    setTeamError(null);
    setLoadingTeamPriorities(true);
    fetchTeamPriorities(id)
      .then((data) => {
        setTeamPriorities(data);
        setPrimaryArea(data.focus_areas[0]?.area ?? null);
      })
      .catch(() => setTeamError("Could not load this team's priorities. Is the API server running?"))
      .finally(() => setLoadingTeamPriorities(false));
  };

  const selectPlayer = (id: number) => {
    setPlayerId(id);
    setPlayerProfile(null);
    setChosenGoal(null);
    setPlayerPlan(null);
    setPlayerError(null);
    setLoadingPlayerProfile(true);
    fetchPlayerProfile(id)
      .then((data) => {
        setPlayerProfile(data);
        setChosenGoal(data.priorities.weaknesses[0]?.area ?? CUSTOM_GOAL_OPTION);
      })
      .catch(() => setPlayerError("Could not load this player's priorities. Is the API server running?"))
      .finally(() => setLoadingPlayerProfile(false));
  };

  useEffect(() => {
    fetchTeams()
      .then((list) => {
        setTeams(list);
        if (list[0]) selectTeam(list[0].id);
      })
      .catch(() => setTeamError("Could not load the team list. Is the API server running?"));
    fetchPlayers()
      .then((list) => {
        setPlayers(list);
      })
      .catch(() => setPlayerError("Could not load the player list. Is the API server running?"));
  }, []);

  const focusAreaByArea = new Map<string, ImprovementPriority>((teamPriorities?.focus_areas ?? []).map((f) => [f.area, f]));
  const primaryItem = primaryArea ? focusAreaByArea.get(primaryArea) : undefined;
  const secondaryItem = teamPriorities?.focus_areas.find((f) => f.area !== primaryArea);

  const runTeamSession = async () => {
    if (teamId == null) return;
    setTeamSessionLoading(true);
    setTeamNarrative(null);
    setTeamError(null);
    try {
      const data = await generateTeamSession(teamId, {
        primary_area: teamPriorities?.has_sufficient_data ? primaryArea : null,
        secondary_area: teamPriorities?.has_sufficient_data ? secondaryItem?.area ?? null : null,
        session_type: teamPriorities?.has_sufficient_data ? null : sessionType,
        custom_goal: teamCustomGoal || null,
        duration_minutes: teamDuration,
        difficulty: teamDifficulty,
      });
      setTeamSession(data);
      logActivity("Practice plan generated", teamPriorities?.team.name);
    } catch (err) {
      setTeamError(err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.");
    } finally {
      setTeamSessionLoading(false);
    }
  };

  const runTeamNarrative = async () => {
    if (teamId == null || !teamSession) return;
    setTeamNarrativeLoading(true);
    setTeamError(null);
    try {
      const data = await generateTeamPracticeNarrative(teamId, {
        primary_objective: teamSession.primary_objective,
        primary_rationale: teamSession.primary_rationale,
        secondary_objective: teamSession.secondary_objective,
        secondary_rationale: teamSession.secondary_rationale,
        custom_goal: teamCustomGoal || null,
        duration_minutes: teamDuration,
        difficulty: teamDifficulty,
      });
      setTeamNarrative(data);
      logActivity("Practice narrative generated", teamPriorities?.team.name);
    } catch (err) {
      setTeamError(err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.");
    } finally {
      setTeamNarrativeLoading(false);
    }
  };

  const runPlayerPlan = async () => {
    if (playerId == null) return;
    const isCustom = chosenGoal === CUSTOM_GOAL_OPTION || chosenGoal == null;
    const goal = isCustom ? customGoalText : chosenGoal;
    const goalReason = isCustom ? null : playerProfile?.priorities.weaknesses.find((w) => w.area === chosenGoal)?.reason ?? null;
    if (!goal) {
      setPlayerError("Please select or describe a goal for the practice session.");
      return;
    }
    setPlayerPlanLoading(true);
    setPlayerError(null);
    try {
      const data = await generatePlayerPracticePlan(playerId, {
        goal,
        goal_reason: goalReason,
        custom_instructions: playerInstructions || null,
        duration_minutes: playerDuration,
        difficulty: playerDifficulty,
      });
      setPlayerPlan(data);
      logActivity("Practice plan generated", playerProfile ? `${playerProfile.player.first_name} ${playerProfile.player.last_name}` : undefined);
    } catch (err) {
      setPlayerError(err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.");
    } finally {
      setPlayerPlanLoading(false);
    }
  };

  return (
    <AppShell title="Practice Planner" breadcrumb="Coaching">
      <PageHeader title="Practice Planner" description="Turn the latest performance signals into a focused coaching session." />

      <div className="mb-6 flex gap-2 border-b border-border pb-2">
        {(["team", "player"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors duration-150 ${
              mode === m ? "bg-brand-blue text-white" : "text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "team" ? (
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <Card className="p-5">
              <SectionHeading title="Session setup" />
              <div className="space-y-4">
                <Select label="Team" value={teamId ?? ""} onChange={(e) => selectTeam(Number(e.target.value))}>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>

                {loadingTeamPriorities && (
                  <p className="flex items-center gap-2 text-xs text-text-secondary">
                    <Spinner /> Loading priorities…
                  </p>
                )}

                {teamPriorities &&
                  (teamPriorities.has_sufficient_data ? (
                    teamPriorities.focus_areas.length > 0 ? (
                      <>
                        <Select
                          label="Primary training objective"
                          value={primaryArea ?? ""}
                          onChange={(e) => setPrimaryArea(e.target.value)}
                        >
                          {teamPriorities.focus_areas.map((f) => (
                            <option key={f.area} value={f.area}>
                              {f.area}
                            </option>
                          ))}
                        </Select>
                        {primaryItem && <p className="text-xs text-text-secondary">📌 {primaryItem.reason}</p>}
                        {secondaryItem && (
                          <p className="text-xs text-text-secondary">
                            🔄 Secondary focus (auto-selected): {secondaryItem.area} - {secondaryItem.reason}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-text-secondary">
                        {teamPriorities.team.name} is at or above league average on every tracked metric.
                      </p>
                    )
                  ) : (
                    <>
                      <p className="text-xs text-text-secondary">{teamPriorities.insufficient_data_reason}</p>
                      <Select label="Session type" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                        {SESSION_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </>
                  ))}

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-text-primary">Additional instructions (optional)</span>
                  <textarea
                    value={teamCustomGoal}
                    onChange={(e) => setTeamCustomGoal(e.target.value)}
                    placeholder='e.g. "Prepare for a team that presses full court."'
                    rows={2}
                    className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-text-primary">Duration (min)</span>
                    <input
                      type="number"
                      min={15}
                      max={120}
                      step={15}
                      value={teamDuration}
                      onChange={(e) => setTeamDuration(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary"
                    />
                  </label>
                  <Select label="Difficulty" value={teamDifficulty} onChange={(e) => setTeamDifficulty(e.target.value as typeof teamDifficulty)}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>

                <Button type="button" fullWidth onClick={() => void runTeamSession()} disabled={teamSessionLoading || teamId == null}>
                  {teamSessionLoading ? <Spinner /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  Generate Practice Plan
                </Button>

                {teamError && (
                  <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {teamError}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {!teamSession ? (
              <Card className="grid min-h-80 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-surface-secondary text-text-secondary">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-text-primary">Your session will appear here</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">Choose the objective and generate a timed, coach-ready plan.</p>
                </div>
              </Card>
            ) : teamSession.unavailable ? (
              <Card className="p-5">
                <p className="text-sm text-text-secondary">
                  Training session generation is temporarily unavailable (AI provider not reachable/configured). Try again in a moment.
                </p>
              </Card>
            ) : (
              <>
                <TrainingSessionView session={teamSession.training_session} />
                <Card className="border-intelligence-border bg-intelligence p-5">
                  <h3 className="text-sm font-bold text-text-primary">AI coaching narrative (optional)</h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Enriches the session above with per-player individualization - the session above is already complete without it.
                  </p>
                  <Button type="button" className="mt-3" onClick={() => void runTeamNarrative()} disabled={teamNarrativeLoading}>
                    {teamNarrativeLoading ? <Spinner /> : null}
                    Add AI coaching narrative
                  </Button>
                  {teamNarrative && (
                    <div className="mt-4 rounded-lg bg-surface p-4">
                      <CoachAnswer question={`${teamPriorities?.team.name ?? "Team"} practice narrative`} response={teamNarrative} />
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <Card className="p-5">
            <SectionHeading title="Session setup" />
            <div className="space-y-4">
              <Select label="Player" value={playerId ?? ""} onChange={(e) => selectPlayer(Number(e.target.value))}>
                <option value="">Select a player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} {p.position ? `(${p.position})` : ""}
                  </option>
                ))}
              </Select>

              {loadingPlayerProfile && (
                <p className="flex items-center gap-2 text-xs text-text-secondary">
                  <Spinner /> Loading priorities…
                </p>
              )}

              {playerProfile && (
                <>
                  {playerProfile.priorities.weaknesses.length === 0 ? (
                    <p className="text-xs text-text-secondary">
                      No data-driven objective could be determined -{" "}
                      {playerProfile.priorities.has_sufficient_data
                        ? "no metric stood out from the norm in the available data."
                        : playerProfile.priorities.insufficient_data_reason}{" "}
                      Enter a custom goal instead.
                    </p>
                  ) : (
                    <Select label="Objective" value={chosenGoal ?? ""} onChange={(e) => setChosenGoal(e.target.value)}>
                      {playerProfile.priorities.weaknesses.map((w) => (
                        <option key={w.area} value={w.area}>
                          {w.area}
                        </option>
                      ))}
                      <option value={CUSTOM_GOAL_OPTION}>{CUSTOM_GOAL_OPTION}</option>
                    </Select>
                  )}
                  {chosenGoal && chosenGoal !== CUSTOM_GOAL_OPTION && (
                    <p className="text-xs text-text-secondary">
                      Recommended because: {playerProfile.priorities.weaknesses.find((w) => w.area === chosenGoal)?.reason}
                    </p>
                  )}
                  {(chosenGoal === CUSTOM_GOAL_OPTION || playerProfile.priorities.weaknesses.length === 0) && (
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-text-primary">Goal</span>
                      <input
                        value={customGoalText}
                        onChange={(e) => setCustomGoalText(e.target.value)}
                        placeholder="e.g. improve shooting mechanics and free throw consistency"
                        className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary"
                      />
                    </label>
                  )}
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-text-primary">Additional instructions (optional)</span>
                <input
                  value={playerInstructions}
                  onChange={(e) => setPlayerInstructions(e.target.value)}
                  placeholder='e.g. "Focus on left-hand finishing at the rim."'
                  className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-text-primary">Duration (min)</span>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    step={15}
                    value={playerDuration}
                    onChange={(e) => setPlayerDuration(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary"
                  />
                </label>
                <Select label="Difficulty" value={playerDifficulty} onChange={(e) => setPlayerDifficulty(e.target.value as typeof playerDifficulty)}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="button" fullWidth onClick={() => void runPlayerPlan()} disabled={playerPlanLoading || playerId == null}>
                {playerPlanLoading ? <Spinner /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                Generate Practice Plan
              </Button>

              {playerError && (
                <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {playerError}
                </div>
              )}
            </div>
          </Card>

          {playerPlan ? (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <SectionHeading title="Training plan" />
                <AIBadge />
              </div>
              <CoachAnswer
                question={`${playerProfile?.player.first_name ?? "Player"} ${playerProfile?.player.last_name ?? ""} practice plan`}
                response={playerPlan}
              />
            </Card>
          ) : (
            <EmptyState
              icon={<Clock className="h-6 w-6" aria-hidden="true" />}
              title="Your plan will appear here"
              description="Choose a player and objective, then generate a coach-ready plan."
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
