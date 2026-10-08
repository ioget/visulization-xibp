"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Shield, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, Button, Card, ComparisonBar, DataPill, MetricCard, Select, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { nationalityFlags } from "@/lib/nationality-flags";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import { TeamCalendar } from "@/components/dashboard/TeamCalendar";
import {
  ApiError,
  fetchTeamOverview,
  fetchTeams,
  generateTeamReport,
  type CoachResponse,
  type PreMatchTeam,
  type TeamOverviewResponse,
  type TeamStyleProfile,
} from "@/lib/api-client";

const TABS = ["Roster", "Recent games", "Standings", "Recommendations", "Calendar"] as const;
type Tab = (typeof TABS)[number];

const _STYLE_METRIC_LABELS: Record<string, { label: string; unit: string; max: number }> = {
  points_pg: { label: "Points/game", unit: "", max: 100 },
  fg_pct: { label: "FG%", unit: "%", max: 60 },
  three_pct: { label: "3P%", unit: "%", max: 50 },
  ft_pct: { label: "FT%", unit: "%", max: 100 },
  three_rate: { label: "3PT attempt rate", unit: "%", max: 60 },
  assists_pg: { label: "Assists/game", unit: "", max: 30 },
  turnovers_pg: { label: "Turnovers/game", unit: "", max: 25 },
  rebounds_pg: { label: "Rebounds/game", unit: "", max: 50 },
  steals_blocks_pg: { label: "Steals + blocks/game", unit: "", max: 20 },
  fouls_pg: { label: "Fouls/game", unit: "", max: 30 },
  paint_scoring_reliance: { label: "Paint scoring reliance", unit: "%", max: 100 },
};

function isPct(unit: string) {
  return unit === "%";
}

interface ReportEntry {
  kind: "tactics" | "squad";
  label: string;
  response: CoachResponse;
  styleProfile: TeamStyleProfile | null;
}

export default function TeamAnalysisPage() {
  const [teams, setTeams] = useState<PreMatchTeam[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

  const [overview, setOverview] = useState<TeamOverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Roster");

  const [reportLog, setReportLog] = useState<ReportEntry[]>([]);
  const [reportLoading, setReportLoading] = useState<"tactics" | "squad" | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const selectTeam = (id: number) => {
    setTeamId(id);
    setOverview(null);
    setOverviewError(null);
    setReportLog([]);
    setReportError(null);
    setTab("Roster");
    setLoadingOverview(true);
    fetchTeamOverview(id)
      .then(setOverview)
      .catch(() => setOverviewError("Could not load this team's overview. Is the API server running?"))
      .finally(() => setLoadingOverview(false));
  };

  useEffect(() => {
    fetchTeams()
      .then((list) => {
        setTeams(list);
        if (list[0]) selectTeam(list[0].id);
      })
      .catch(() => setTeamsError("Could not load the team list. Is the API server running?"));
  }, []);

  const runReport = async (mode: "tactics" | "squad") => {
    if (teamId == null) return;
    setReportLoading(mode);
    setReportError(null);
    try {
      const data = await generateTeamReport(teamId, { mode });
      const label = mode === "tactics" ? "Team Tactical Analysis" : "Squad Analysis";
      setReportLog((log) => [
        ...log,
        { kind: mode, label, response: data.response, styleProfile: data.style_profile },
      ]);
      logActivity(`${label} generated`, overview?.team.name);
    } catch (err) {
      setReportError(
        err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.",
      );
    } finally {
      setReportLoading(null);
    }
  };

  return (
    <AppShell title="Teams" breadcrumb="Intelligence">
      <PageHeader title="Team Analysis" description="Select a team to view roster intelligence and league-relative playing style." />

      <Card className="mb-6 p-5">
        {teamsError ? (
          <p className="text-sm text-error">{teamsError}</p>
        ) : (
          <Select label="Team" value={teamId ?? ""} onChange={(e) => selectTeam(Number(e.target.value))}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        )}
      </Card>

      {overviewError && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {overviewError}
        </div>
      )}

      {loadingOverview && (
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <Spinner /> Loading team overview…
        </p>
      )}

      {overview && (
        <>
          <Card className="mb-6 p-5">
            <div className="flex items-center gap-4">
              {overview.logo_base64 ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
                <img
                  src={`data:image/png;base64,${overview.logo_base64}`}
                  alt={overview.team.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-border bg-white object-contain p-1"
                />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface-secondary text-text-secondary">
                  <Shield className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              <div>
                <h2 className="text-xl font-bold text-text-primary">{overview.team.name}</h2>
                <p className="text-xs text-text-secondary">{overview.team.city ?? overview.team.country ?? ""}</p>
              </div>
            </div>
            {overview.team_stats && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Games played" value={String(overview.team_stats.data.games)} />
                <MetricCard label="Points for" value={String(overview.team_stats.data.points_for)} />
                <MetricCard label="Points against" value={String(overview.team_stats.data.points_against)} />
                <MetricCard
                  label="Point differential"
                  value={`${overview.team_stats.data.points_for - overview.team_stats.data.points_against >= 0 ? "+" : ""}${
                    overview.team_stats.data.points_for - overview.team_stats.data.points_against
                  }`}
                />
              </div>
            )}
          </Card>

          {overview.style_profile && (
            <Card className="mb-6 p-5">
              <h3 className="text-sm font-bold text-text-primary">Team style vs. league average</h3>
              {overview.style_profile.traits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {overview.style_profile.traits.map((t) => (
                    <DataPill key={t}>{t}</DataPill>
                  ))}
                </div>
              )}
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {Object.entries(overview.style_profile.team_metrics).map(([key, value]) => {
                  const meta = _STYLE_METRIC_LABELS[key] ?? { label: key, unit: "", max: Math.max(value * 1.5, 1) };
                  const leagueValue = overview.style_profile!.league_metrics[key] ?? 0;
                  const scale = isPct(meta.unit) ? 100 : 1;
                  return (
                    <ComparisonBar
                      key={key}
                      label={meta.label}
                      value={Math.round(value * scale * 10) / 10}
                      average={Math.round(leagueValue * scale * 10) / 10}
                      max={meta.max}
                      unit={meta.unit}
                      averageLabel="League"
                    />
                  );
                })}
              </div>
            </Card>
          )}

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

          {tab === "Roster" && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-165 text-left text-xs">
                  <thead className="bg-surface-secondary text-[10px] uppercase text-text-secondary">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Player</th>
                      <th className="px-4 py-2.5 font-semibold">Position</th>
                      <th className="px-4 py-2.5 font-semibold">Height</th>
                      <th className="px-4 py-2.5 font-semibold">Nationality</th>
                      <th className="px-4 py-2.5 font-semibold">Age</th>
                      <th className="px-4 py-2.5 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.roster.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {p.photo_base64 ? (
                              // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset
                              <img
                                src={`data:image/jpeg;base64,${p.photo_base64}`}
                                alt={`${p.first_name} ${p.last_name}`}
                                className="h-8 w-8 shrink-0 rounded-full border border-border bg-white object-cover"
                              />
                            ) : (
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-secondary text-text-secondary">
                                <UserRound className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                            <span className="font-semibold text-text-primary">
                              {p.first_name} {p.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{p.position ?? "-"}</td>
                        <td className="px-4 py-3 tabular-nums text-text-secondary">{p.height_cm ? `${p.height_cm} cm` : "-"}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          <span className="mr-1.5">{nationalityFlags(p.nationality)}</span>
                          {p.nationality ?? "-"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-text-secondary">{p.age ?? "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/players?player=${p.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-brand-blue transition-colors duration-150 ease-out hover:bg-surface-secondary"
                          >
                            <UserRound className="h-3 w-3" aria-hidden="true" /> View details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "Recent games" && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-130 text-left text-xs">
                  <thead className="bg-surface-secondary text-[10px] uppercase text-text-secondary">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Date</th>
                      <th className="px-4 py-2.5 font-semibold">Matchup</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Score</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recent_games.map((g) => (
                      <tr key={g.id} className="border-t border-border">
                        <td className="px-4 py-3">{g.scheduled_at ?? "-"}</td>
                        <td className="px-4 py-3 font-semibold text-text-primary">
                          {g.home_team} vs {g.away_team}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {g.home_score != null ? `${g.home_score}-${g.away_score}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{g.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "Standings" && (
            <Card className="p-5">
              {overview.standings.length === 0 ? (
                <p className="text-sm text-text-secondary">No standings data is currently available for this team.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase text-text-secondary">
                      <th className="pb-2">Competition</th>
                      <th className="pb-2 text-right">Rank</th>
                      <th className="pb-2 text-right">W</th>
                      <th className="pb-2 text-right">L</th>
                      <th className="pb-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.standings.map((s, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="py-2">{s.competition}</td>
                        <td className="py-2 text-right tabular-nums">{s.rank}</td>
                        <td className="py-2 text-right tabular-nums">{s.wins}</td>
                        <td className="py-2 text-right tabular-nums">{s.losses}</td>
                        <td className="py-2 text-right tabular-nums">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === "Recommendations" && (
            <div className="space-y-6">
              <Card className="p-5">
                <p className="text-xs text-text-secondary">Generated by the Supervisor Agent + Coach Chain - the same pipeline as Ask Coach.</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Button type="button" fullWidth onClick={() => void runReport("tactics")} disabled={reportLoading !== null}>
                      {reportLoading === "tactics" ? <Spinner /> : null}
                      Analyze strengths, weaknesses & recommendations
                    </Button>
                    <p className="mt-1.5 text-[11px] text-text-secondary">
                      Compares this team&apos;s real stats to the league average to find genuine strengths and weaknesses, then connects
                      them to tactical recommendations grounded in coaching literature.
                    </p>
                  </div>
                  <div className="flex-1">
                    <Button type="button" fullWidth onClick={() => void runReport("squad")} disabled={reportLoading !== null}>
                      {reportLoading === "squad" ? <Spinner /> : null}
                      Squad Analysis
                    </Button>
                    <p className="mt-1.5 text-[11px] text-text-secondary">
                      Looks at roster depth and player roles - who to rely on, where the squad is thin, and personnel-level
                      considerations for this team.
                    </p>
                  </div>
                </div>
                {reportError && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {reportError}
                  </div>
                )}
              </Card>

              {reportLog.map((entry, i) => (
                <Card key={i} className="border-intelligence-border bg-intelligence p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary">{entry.label}</h3>
                    <AIBadge />
                  </div>
                  <div className="mt-3">
                    <CoachAnswer question={`${overview.team.name} - ${entry.label}`} response={entry.response} />
                  </div>
                  {entry.styleProfile && (
                    <p className="mt-3 text-[11px] text-text-secondary">
                      Statistical style profile ({entry.styleProfile.games} games analyzed):{" "}
                      {entry.styleProfile.traits.length > 0 ? entry.styleProfile.traits.join(", ") : "no clear statistical tendency yet (limited game sample)"}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {tab === "Calendar" && (
            <Card className="p-5">
              {overview.calendar_games.length === 0 ? (
                <p className="text-sm text-text-secondary">No scheduled or played games found for this team.</p>
              ) : (
                <TeamCalendar games={overview.calendar_games} />
              )}
            </Card>
          )}
        </>
      )}

      {!overview && !loadingOverview && !overviewError && teams.length === 0 && !teamsError && (
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <Spinner /> Loading teams…
        </p>
      )}
    </AppShell>
  );
}
