"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Download, Target, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, AIInsight, Button, Card, ComparisonTable, EmptyState, Select, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import { CoachChartView } from "@/components/coach/CoachChartView";
import {
  ApiError,
  downloadPostMatchPdf,
  downloadPostMatchDocx,
  fetchGamesBetween,
  fetchTeams,
  generatePostMatchFinalRecommendations,
  generatePostMatchReport,
  type CoachResponse,
  type PostMatchGame,
  type PostMatchReportResponse,
  type PreMatchTeam,
  type TacticalCard,
} from "@/lib/api-client";

function TacticalCards({ title, cards }: { title: string; cards: TacticalCard[] }) {
  if (cards.length === 0) return null;
  return (
    <AIInsight title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg border border-intelligence-border bg-surface p-3">
            {card.title && <h4 className="text-xs font-bold text-text-primary">{card.title}</h4>}
            {card.fact && <p className="mt-1.5 text-xs leading-5 text-text-secondary">{card.fact}</p>}
            {card.action && <p className="mt-1.5 text-xs font-medium text-brand-blue">→ {card.action}</p>}
          </div>
        ))}
      </div>
    </AIInsight>
  );
}

function gameLabel(g: PostMatchGame): string {
  const date = g.scheduled_at ? g.scheduled_at.slice(0, 10) : "date unknown";
  const score = g.home_score != null ? `${g.home_score}-${g.away_score}` : "Not yet played";
  return `${date} · ${g.home_team} ${score} ${g.away_team}`;
}

export default function PostMatchPage() {
  const [teams, setTeams] = useState<PreMatchTeam[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [teamAId, setTeamAId] = useState<number | null>(null);
  const [teamBId, setTeamBId] = useState<number | null>(null);

  const [gamesBetween, setGamesBetween] = useState<PostMatchGame[]>([]);
  const [gamesBetweenError, setGamesBetweenError] = useState<string | null>(null);
  const [gamesBetweenLoading, setGamesBetweenLoading] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PostMatchReportResponse | null>(null);
  const [reportMode, setReportMode] = useState<"analyze" | "deep_analysis">("analyze");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "docx">("pdf");

  const [finalRecommendations, setFinalRecommendations] = useState<CoachResponse | null>(null);
  const [finalRecLoading, setFinalRecLoading] = useState(false);
  const [finalRecError, setFinalRecError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams()
      .then((list) => {
        setTeams(list);
        setTeamAId((current) => current ?? list[0]?.id ?? null);
        setTeamBId((current) => current ?? list[1]?.id ?? list[0]?.id ?? null);
      })
      .catch(() => setTeamsError("Could not load the team list. Is the API server running?"));
  }, []);

  // "My team" -> "Opponent" -> "Game" is a strict cascade: a stale
  // selection from the previous matchup must never linger once either
  // side changes. Cleared during render (React's own recommended pattern
  // for resetting state when a dependency changes -- see "You Might Not
  // Need an Effect"), not inside the effect below, which stays limited to
  // the actual external sync (the fetch) plus its own async callbacks.
  const [lastTeamPair, setLastTeamPair] = useState<[number | null, number | null]>([teamAId, teamBId]);
  if (lastTeamPair[0] !== teamAId || lastTeamPair[1] !== teamBId) {
    setLastTeamPair([teamAId, teamBId]);
    setGameId(null);
    setGamesBetween([]);
    setGamesBetweenError(null);
    setGamesBetweenLoading(teamAId != null && teamBId != null && teamAId !== teamBId);
  }

  useEffect(() => {
    if (teamAId == null || teamBId == null || teamAId === teamBId) return;
    fetchGamesBetween(teamAId, teamBId)
      .then((list) => {
        setGamesBetween(list);
        setGameId(list[0]?.game_id ?? null);
      })
      .catch(() => setGamesBetweenError("Could not load games between these two teams."))
      .finally(() => setGamesBetweenLoading(false));
  }, [teamAId, teamBId]);

  const generate = async (mode: "analyze" | "deep_analysis") => {
    if (gameId == null) return;
    setLoading(true);
    setError(null);
    setFinalRecommendations(null);
    setFinalRecError(null);
    try {
      const data = await generatePostMatchReport({ game_id: gameId, mode });
      setReport(data);
      setReportMode(mode);
      logActivity("Post-Match report generated", `${data.home_name} vs ${data.away_name}`);
      setLoading(false);
      // Automatic, no button: every report is immediately followed by a
      // second, explicit "final recommendations" synthesis call over the
      // report that was just shown -- never gated behind a separate click.
      setFinalRecLoading(true);
      try {
        const { summary = "", analysis = "" } = data.llm_response ?? {};
        const finalRecs = await generatePostMatchFinalRecommendations(gameId, mode, summary, analysis);
        setFinalRecommendations(finalRecs);
      } catch (err) {
        setFinalRecError(
          err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.",
        );
      } finally {
        setFinalRecLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `The coach backend returned an error (${err.status}).`
          : "Could not reach the coach backend. Is the API server running?",
      );
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!report || gameId == null) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const { summary = "", analysis = "", recommendations = [] } = report.llm_response ?? {};
      const blob =
        downloadFormat === "pdf"
          ? await downloadPostMatchPdf(gameId, reportMode, summary, analysis, recommendations, finalRecommendations)
          : await downloadPostMatchDocx(gameId, reportMode, summary, analysis, recommendations, finalRecommendations);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.home_name}_vs_${report.away_name}_post_match_report.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setPdfError(
        err instanceof ApiError ? `The coach backend returned an error (${err.status}).` : "Could not reach the coach backend.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // Mirrors report/post_match_data.py's own _PLAYER_BAR_CHARTS spec (title,
  // GamePlayerMetrics attribute, pct-scaling) -- the PDF rasterizes these as
  // matplotlib PNGs, but every field they're built from (report.roster.players,
  // this team's full GamePlayerMetrics.to_dict() per player) is already in the
  // JSON response, so they're rendered here as real React charts instead.
  const playerChartGroups = useMemo(() => {
    if (!report || report.roster.players.length === 0) return null;
    const players = report.roster.players;
    const labels = players.map((p) => p.name);
    const pct = (v: number | null) => (v ?? 0) * 100;
    const bar = (title: string, values: number[]) => ({ type: "bar" as const, title, x_labels: labels, series: [{ name: title, values }] });

    const general = [
      bar("Minutes played by each player", players.map((p) => p.minutes)),
      bar("Assists by each player", players.map((p) => p.assists)),
      bar("Rebounds by each player", players.map((p) => p.rebounds_total)),
      bar("Blocks by each player", players.map((p) => p.blocks)),
      bar("Steals by each player", players.map((p) => p.steals)),
      bar("Turnovers by each player", players.map((p) => p.turnovers)),
      bar("Plus/minus impact by each player", players.map((p) => p.plus_minus)),
      {
        type: "bar" as const, title: "Shot analysis: field goals and 3-pointers", x_labels: labels,
        series: [
          { name: "FGM", values: players.map((p) => p.fgm) },
          { name: "FGA", values: players.map((p) => p.fga) },
          { name: "3PM", values: players.map((p) => p.three_pm) },
          { name: "3PA", values: players.map((p) => p.three_pa) },
        ],
      },
    ];

    const advanced = [
      bar("Effective field goal % (eFG%)", players.map((p) => pct(p.efg_pct))),
      bar("Rebound contribution", players.map((p) => pct(p.rebound_contribution))),
      bar("Assist-to-turnover ratio (AST/TO)", players.map((p) => p.ast_to ?? 0)),
      bar("Points per minute (PPM)", players.map((p) => p.ppm ?? 0)),
      bar("True shooting % (TS%)", players.map((p) => pct(p.ts_pct))),
      bar("Usage rate (USG%)", players.map((p) => pct(p.usg_pct))),
      bar("Player impact estimate (PIE)", players.map((p) => pct(p.pie))),
      {
        type: "bar" as const, title: "Offensive & defensive rebound %", x_labels: labels,
        series: [
          { name: "OREB%", values: players.map((p) => pct(p.oreb_pct)) },
          { name: "DREB%", values: players.map((p) => pct(p.dreb_pct)) },
        ],
      },
    ];

    const impact = [
      bar("Offensive efficiency (OE)", players.map((p) => p.offensive_efficiency ?? 0)),
      bar("Defensive impact (DI)", players.map((p) => p.defensive_impact)),
    ];

    return { general, advanced, impact };
  }, [report]);

  if (!report) {
    return (
      <AppShell title="Post-Match" breadcrumb="Game">
        <PageHeader
          title="Post-Match Review"
          description="Select a completed game to review what happened and what changes going forward."
        />

        <Card className="mx-auto max-w-2xl p-6">
          {teamsError ? (
            <p className="text-sm text-error">{teamsError}</p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select label="My team" value={teamAId ?? ""} onChange={(e) => setTeamAId(Number(e.target.value))}>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select label="Opponent" value={teamBId ?? ""} onChange={(e) => setTeamBId(Number(e.target.value))}>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          {teamAId != null && teamAId === teamBId && (
            <p className="mt-2 text-xs text-text-secondary">Choose two different teams to see their games.</p>
          )}

          <div className="mt-4">
            {gamesBetweenError ? (
              <p className="text-sm text-error">{gamesBetweenError}</p>
            ) : gamesBetweenLoading ? (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Spinner /> Loading games between these two teams…
              </div>
            ) : teamAId != null && teamBId != null && teamAId !== teamBId && gamesBetween.length === 0 ? (
              <p className="text-sm text-text-secondary">No completed games found yet between these two teams.</p>
            ) : gamesBetween.length > 0 ? (
              <Select label="Game" value={gameId ?? ""} onChange={(e) => setGameId(Number(e.target.value))}>
                {gamesBetween.map((g) => (
                  <option key={g.game_id} value={g.game_id}>
                    {gameLabel(g)}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" fullWidth size="lg" onClick={() => void generate("analyze")} disabled={loading || gameId == null}>
              {loading ? <Spinner /> : <ClipboardCheck className="h-4 w-4" aria-hidden="true" />}
              Analyze Match
            </Button>
            <Button type="button" fullWidth size="lg" onClick={() => void generate("deep_analysis")} disabled={loading || gameId == null}>
              {loading ? <Spinner /> : <Users className="h-4 w-4" aria-hidden="true" />}
              Deep Analysis
            </Button>
          </div>
          {loading && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-intelligence p-4 text-xs text-text-secondary">
              <Spinner />
              <div className="space-y-1">
                <p>Running the event-based tactical engine</p>
                <p>Comparing the real box score</p>
                <p>Consulting basketball knowledge</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
        </Card>
      </AppShell>
    );
  }

  const won = report.result.label === "WIN";
  const tied = report.result.label === "TIE";
  const scoringRunEntries = Object.entries(report.scoring_runs);
  const biggestScoringRun = scoringRunEntries.length > 0 ? scoringRunEntries.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
  const topPerformers = [...report.roster.players].sort((a, b) => b.eval_rating - a.eval_rating).slice(0, 5);

  return (
    <AppShell title="Post-Match" breadcrumb="Game">
      <PageHeader
        title={`${report.home_name} vs ${report.away_name}`}
        description={`${report.meta.type} · ${report.meta.competition_season} · ${report.meta.fixture}`}
        actions={
          <>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as "pdf" | "docx")}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-orange"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={pdfLoading}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:bg-surface-secondary disabled:opacity-60"
            >
              {pdfLoading ? <Spinner /> : <Download className="h-4 w-4" aria-hidden="true" />}
              {pdfLoading ? "Generating…" : "Download"}
            </button>
            <Button type="button" size="sm" onClick={() => setReport(null)}>
              New review
            </Button>
          </>
        }
      />

      {pdfError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {pdfError}
        </div>
      )}

      <Card className="mb-6 p-6">
        <div className="mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-5 text-center">
          <div>
            <p className="text-sm font-bold text-text-primary">{report.home_name}</p>
            <p className={`mt-2 text-5xl font-black tabular-nums ${won || tied ? "text-text-primary" : "text-text-secondary"}`}>
              {report.result.home_score}
            </p>
          </div>
          <div>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black ${
                tied ? "bg-warning/15 text-warning" : won ? "bg-success/15 text-success" : "bg-error/15 text-error"
              }`}
            >
              {report.result.label}
            </span>
            <p className="mt-2 text-xs text-text-secondary">FINAL</p>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{report.away_name}</p>
            <p className={`mt-2 text-5xl font-black tabular-nums ${!won && !tied ? "text-text-primary" : "text-text-secondary"}`}>
              {report.result.away_score}
            </p>
          </div>
        </div>

        {biggestScoringRun && (
          <p className="mt-4 text-center text-xs text-text-secondary">
            Biggest scoring run: <b className="text-text-primary">+{biggestScoringRun[1]}</b> ({biggestScoringRun[0]})
          </p>
        )}

        {report.raw.period_scores.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <CoachChartView
              chart={{
                type: "bar",
                title: "Score by period",
                x_labels: report.raw.period_scores.map((p) => p.label),
                series: [
                  { name: report.home_name, values: report.raw.period_scores.map((p) => p.home_points) },
                  { name: report.away_name, values: report.raw.period_scores.map((p) => p.away_points) },
                ],
              }}
            />
          </div>
        )}
      </Card>

      {report.executive_summary.length > 0 && (
        <AIInsight title="Executive summary" className="mb-6">
          <ul className="space-y-1.5">
            {report.executive_summary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </AIInsight>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">Scoring</h3>
          <ComparisonTable rows={report.scoring_rows} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">Rebounding & ball control</h3>
          <ComparisonTable rows={report.rebounding_rows} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">Advanced</h3>
          <ComparisonTable rows={report.advanced_rows} />
        </Card>
      </div>

      {report.event_style_metrics.length > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Style metrics (from play-by-play)</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
            {report.event_style_metrics.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      {report.key_players_table.length > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Key performers</h3>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase text-text-secondary">
                <th className="pb-2">Player</th>
                <th className="pb-2">Team</th>
                <th className="pb-2 text-right">PTS</th>
                <th className="pb-2 text-right">REB</th>
                <th className="pb-2 text-right">AST</th>
                <th className="pb-2 text-right">EVAL</th>
              </tr>
            </thead>
            <tbody>
              {report.key_players_table.map((p, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 font-semibold text-text-primary">{p.player}</td>
                  <td className="py-2 text-text-secondary">{p.team}</td>
                  <td className="py-2 text-right tabular-nums">{p.points}</td>
                  <td className="py-2 text-right tabular-nums">{p.rebounds}</td>
                  <td className="py-2 text-right tabular-nums">{p.assists}</td>
                  <td className="py-2 text-right font-bold tabular-nums text-brand-blue">{p.evaluation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {report.roster.players.length > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">{report.roster.team_name} box score</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase text-text-secondary">
                  {report.roster.columns.map(([label]) => (
                    <th key={label} className="pb-2 pr-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.roster.players.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {report.roster.columns.map(([label, key]) => (
                      <td key={label} className="py-2 pr-3 tabular-nums text-text-primary first:font-semibold first:text-text-primary">
                        {String((row as unknown as Record<string, unknown>)[key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {topPerformers.length > 0 && (
        <Card className="mb-6 p-5">
          <CoachChartView
            chart={{
              type: "bar",
              title: "Top performers by efficiency (top 5, by EVAL)",
              x_labels: topPerformers.map((p) => p.name),
              series: [{ name: "EVAL", values: topPerformers.map((p) => p.eval_rating) }],
            }}
          />
        </Card>
      )}

      {playerChartGroups && (
        <>
          <Card className="mb-6 p-5">
            <h3 className="mb-3 text-sm font-bold text-text-primary">Player general metrics</h3>
            <div className="grid gap-5 md:grid-cols-2">
              {playerChartGroups.general.map((c) => (
                <CoachChartView key={c.title} chart={c} />
              ))}
            </div>
          </Card>
          <Card className="mb-6 p-5">
            <h3 className="mb-3 text-sm font-bold text-text-primary">Player advanced metrics</h3>
            <div className="grid gap-5 md:grid-cols-2">
              {playerChartGroups.advanced.map((c) => (
                <CoachChartView key={c.title} chart={c} />
              ))}
            </div>
          </Card>
          <Card className="mb-6 p-5">
            <h3 className="mb-3 text-sm font-bold text-text-primary">Player efficiency &amp; impact</h3>
            <div className="grid gap-5 md:grid-cols-2">
              {playerChartGroups.impact.map((c) => (
                <CoachChartView key={c.title} chart={c} />
              ))}
            </div>
          </Card>
        </>
      )}

      {(report.team_strengths.length > 0 || report.team_weaknesses.length > 0) && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Team strengths &amp; weaknesses (this game)</h3>
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            {report.team_strengths.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-success">Strengths</h4>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  {report.team_strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.team_weaknesses.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-error">Weaknesses</h4>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  {report.team_weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="mb-6 space-y-6">
        <TacticalCards title="What worked" cards={report.what_worked} />
        <TacticalCards title="Tactical observations" cards={report.tactical_observations} />
        <TacticalCards title="Player performance" cards={report.player_performance} />
      </div>

      {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {report.strengths.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-success">Strengths</h3>
              <div className="mt-3 space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-bold text-text-primary">{s.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{s.evidence}</p>
                    <p className="mt-1 text-xs font-medium text-brand-blue">→ {s.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {report.weaknesses.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-error">Weaknesses</h3>
              <div className="mt-3 space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-bold text-text-primary">{w.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{w.evidence}</p>
                    <p className="mt-1 text-xs font-medium text-brand-blue">→ {w.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {report.star_dependency_text && (
        <Card className="mb-6 p-4">
          <p className="text-sm text-text-secondary">{report.star_dependency_text}</p>
        </Card>
      )}

      {report.coaching_takeaways.length > 0 && (
        <Card className="border-intelligence-border bg-intelligence p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">What changes going forward?</h3>
            <AIBadge />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {report.coaching_takeaways.map(([priority, why, action], i) => (
              <div key={i} className="rounded-lg bg-surface p-3 text-xs leading-5 text-text-primary">
                <b className="text-brand-blue">0{i + 1}</b> {priority}
                <p className="mt-1 text-text-secondary">{why}</p>
                <p className="mt-1 font-medium text-brand-blue">→ {action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(Object.values(report.reliability).some((items) => items.length > 0) || report.metric_definitions.length > 0) && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Reliability &amp; scope</h3>
          <div className="mt-3 space-y-2">
            {Object.entries(report.reliability).map(([key, items]) =>
              items.length > 0 ? (
                <p key={key} className="text-xs text-text-secondary">
                  <b className="capitalize text-text-primary">{key.replace(/_/g, " ")}:</b> {items.join(" ")}
                </p>
              ) : null,
            )}
          </div>
          {report.metric_definitions.length > 0 && (
            <div className="mt-4 overflow-x-auto border-t border-border pt-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-secondary">Metric definitions</h4>
              <table className="w-full text-xs">
                <tbody>
                  {report.metric_definitions.map(([label, definition]) => (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="w-48 py-1.5 pr-4 align-top font-semibold text-text-primary">{label}</td>
                      <td className="py-1.5 text-text-secondary">{definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Card className="mb-6 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Final recommendations</h3>
          {finalRecommendations && <AIBadge />}
        </div>
        {finalRecLoading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
            <Spinner /> XamCoach is synthesizing the report above into final recommendations…
          </div>
        )}
        {finalRecError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {finalRecError}
          </div>
        )}
        {finalRecommendations && (
          <div className="mt-3">
            <CoachAnswer question={`${report.home_name} vs ${report.away_name} - final recommendations`} response={finalRecommendations} />
          </div>
        )}
      </Card>

      {!report.scoring_rows.length && !report.what_worked.length && (
        <EmptyState
          icon={<Target className="h-6 w-6" aria-hidden="true" />}
          title="Limited data for this game"
          description="Not enough box-score or play-by-play data was available to build a full recap."
        />
      )}
    </AppShell>
  );
}
