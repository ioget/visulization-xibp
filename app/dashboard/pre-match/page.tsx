"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, ShieldAlert, Swords, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, AIInsight, Button, Card, ComparisonTable, DataPill, EmptyState, MetricCard, Select, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { CoachAnswer } from "@/components/coach/CoachAnswer";
import { CoachChartView } from "@/components/coach/CoachChartView";
import {
  ApiError,
  downloadPreMatchPdf,
  downloadPreMatchDocx,
  fetchTeams,
  generatePreMatchFinalRecommendations,
  generatePreMatchReport,
  type CoachResponse,
  type OpponentProfileRow,
  type PreMatchReportResponse,
  type PreMatchTeam,
  type TacticalCard,
} from "@/lib/api-client";

function TacticalCards({ title, icon: Icon, cards }: { title: string; icon: typeof Target; cards: TacticalCard[] }) {
  if (cards.length === 0) return null;
  return (
    <AIInsight title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg border border-intelligence-border bg-surface p-3">
            {card.title && (
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                <h4 className="text-xs font-bold text-text-primary">{card.title}</h4>
              </div>
            )}
            {card.fact && <p className="mt-1.5 text-xs leading-5 text-text-secondary">{card.fact}</p>}
            {card.action && <p className="mt-1.5 text-xs font-semibold text-brand-blue">→ {card.action}</p>}
          </div>
        ))}
      </div>
    </AIInsight>
  );
}

function OpponentProfileList({ rows }: { rows: OpponentProfileRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-text-secondary">No data available.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
          <span className="text-text-secondary">{row.label}</span>
          <span className="flex items-center gap-2 tabular-nums">
            <b className="text-text-primary">{row.value}</b>
            <span className="text-[11px] text-text-muted">vs {row.league_value} league</span>
            {row.direction !== "flat" && (
              <TrendingUp
                className={`h-3.5 w-3.5 ${row.direction === "up" ? "text-success" : "rotate-180 text-error"}`}
                aria-hidden="true"
              />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PreMatchPage() {
  const [teams, setTeams] = useState<PreMatchTeam[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [teamAId, setTeamAId] = useState<number | null>(null);
  const [teamBId, setTeamBId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [report, setReport] = useState<PreMatchReportResponse | null>(null);
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

  const generate = async (mode: "tactical_briefing" | "deep_analysis") => {
    if (teamAId == null || teamBId == null || teamAId === teamBId) return;
    setLoading(true);
    setError(null);
    setFinalRecommendations(null);
    setFinalRecError(null);
    try {
      const data = await generatePreMatchReport({ team_a_id: teamAId, team_b_id: teamBId, mode });
      setReport(data);
      logActivity("Pre-Match briefing generated", `${data.home_name} vs ${data.away_name}`);
      setLoading(false);
      // Automatic, no button: every report is immediately followed by a
      // second, explicit "final recommendations" synthesis call over the
      // report that was just shown -- never gated behind a separate click.
      setFinalRecLoading(true);
      try {
        const { summary = "", analysis = "" } = data.llm_response ?? {};
        const finalRecs = await generatePreMatchFinalRecommendations(teamAId, teamBId, summary, analysis);
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
    if (!report || teamAId == null || teamBId == null) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      // Defensive fallback: a report fetched before this field existed (a
      // stale in-memory object from an older session) must still attempt
      // the download instead of throwing before the network call ever
      // fires -- the PDF just comes out with empty analysis text in that
      // case, not a silent no-op button.
      const { summary = "", analysis = "", recommendations = [] } = report.llm_response ?? {};
      const blob =
        downloadFormat === "pdf"
          ? await downloadPreMatchPdf(teamAId, teamBId, summary, analysis, recommendations, finalRecommendations)
          : await downloadPreMatchDocx(teamAId, teamBId, summary, analysis, recommendations, finalRecommendations);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.home_name}_vs_${report.away_name}_pre_match_report.${downloadFormat}`;
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

  const formChartHome = useMemo(
    () =>
      report && report.raw.form_home.values.length > 1
        ? { type: "line" as const, title: "Point differential, last 5 games", x_labels: report.raw.form_home.labels, series: [{ name: report.home_name, values: report.raw.form_home.values }] }
        : null,
    [report],
  );
  const formChartAway = useMemo(
    () =>
      report && report.raw.form_away.values.length > 1
        ? { type: "line" as const, title: "Point differential, last 5 games", x_labels: report.raw.form_away.labels, series: [{ name: report.away_name, values: report.raw.form_away.values }] }
        : null,
    [report],
  );

  const matchupProfileChart = useMemo(
    () =>
      report && report.raw.matchup_profile.labels.length > 0
        ? {
            type: "bar" as const, title: "Matchup profile", x_labels: report.raw.matchup_profile.labels,
            series: [
              { name: report.home_name, values: report.raw.matchup_profile.home },
              { name: report.away_name, values: report.raw.matchup_profile.away },
            ],
          }
        : null,
    [report],
  );

  const shootingWinrateChart = useMemo(
    () =>
      report && report.raw.shooting_winrate.labels.length > 0
        ? {
            type: "bar" as const, title: "Shooting & win rate", x_labels: report.raw.shooting_winrate.labels,
            series: [
              { name: report.home_name, values: report.raw.shooting_winrate.home },
              { name: report.away_name, values: report.raw.shooting_winrate.away },
            ],
          }
        : null,
    [report],
  );

  const efficiencyChart = useMemo(
    () =>
      report && report.raw.efficiency.labels.length > 0
        ? {
            type: "bar" as const, title: "Offensive / defensive efficiency", x_labels: report.raw.efficiency.labels,
            series: [
              { name: report.home_name, values: report.raw.efficiency.home },
              { name: report.away_name, values: report.raw.efficiency.away },
            ],
          }
        : null,
    [report],
  );

  const opponentVsLeagueChart = useMemo(
    () =>
      report && report.raw.opp_vs_league.labels.length > 0
        ? {
            type: "bar" as const, title: `${report.away_name} vs. league average`, x_labels: report.raw.opp_vs_league.labels,
            series: [
              { name: report.away_name, values: report.raw.opp_vs_league.opponent },
              { name: "League average", values: report.raw.opp_vs_league.league },
            ],
          }
        : null,
    [report],
  );

  const playerComparisonChart = useMemo(
    () =>
      report && report.raw.player_comparison.names.length > 0
        ? {
            type: "bar" as const, title: `${report.away_name} key threats`, x_labels: report.raw.player_comparison.names,
            series: [
              { name: "PPG", values: report.raw.player_comparison.ppg },
              { name: "RPG", values: report.raw.player_comparison.rpg },
              { name: "APG", values: report.raw.player_comparison.apg },
            ],
          }
        : null,
    [report],
  );

  const recentVsSeasonChart = useMemo(() => {
    if (!report) return null;
    const { home, away } = report.form_summary;
    if (home.point_diff_last5 == null || home.point_diff_season == null || away.point_diff_last5 == null || away.point_diff_season == null) {
      return null;
    }
    return {
      type: "bar" as const, title: "Point differential: season vs. last 5 games", x_labels: ["Season avg", "Last 5 games"],
      series: [
        { name: report.home_name, values: [home.point_diff_season, home.point_diff_last5] },
        { name: report.away_name, values: [away.point_diff_season, away.point_diff_last5] },
      ],
    };
  }, [report]);

  const homeAwayChart = useMemo(() => {
    const homeAway = report?.opponent_profile.home_away;
    if (!homeAway || !report) return null;
    const { home_points_for, home_points_against, away_points_for, away_points_against } = homeAway;
    if ([home_points_for, home_points_against, away_points_for, away_points_against].some((v) => v == null)) return null;
    return {
      type: "bar" as const, title: `${report.away_name}: home vs. away scoring`, x_labels: ["Home", "Away"],
      series: [
        { name: "Points for", values: [home_points_for, away_points_for] },
        { name: "Points against", values: [home_points_against, away_points_against] },
      ],
    };
  }, [report]);

  if (!report) {
    return (
      <AppShell title="Pre-Match" breadcrumb="Game">
        <PageHeader
          title="Pre-Match Preparation"
          description="Select the two teams to build a matchup briefing before gameday."
        />

        <Card className="mx-auto max-w-2xl p-6">
          {teamsError ? (
            <p className="text-sm text-error">{teamsError}</p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select label="Home team" value={teamAId ?? ""} onChange={(e) => setTeamAId(Number(e.target.value))}>
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
            <p className="mt-2 text-xs text-text-secondary">Choose two different teams to build a briefing.</p>
          )}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => void generate("tactical_briefing")}
              disabled={loading || teamAId == null || teamAId === teamBId}
            >
              {loading ? <Spinner /> : <Swords className="h-4 w-4" aria-hidden="true" />}
              Tactical Briefing
            </Button>
            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => void generate("deep_analysis")}
              disabled={loading || teamAId == null || teamAId === teamBId}
            >
              {loading ? <Spinner /> : <Target className="h-4 w-4" aria-hidden="true" />}
              Deep Analysis
            </Button>
          </div>
          {loading && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-intelligence p-4 text-xs text-text-secondary">
              <Spinner />
              <div className="space-y-1">
                <p>Comparing team performance data</p>
                <p>Scanning opponent tendencies</p>
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

  return (
    <AppShell title="Pre-Match" breadcrumb="Game">
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
              New briefing
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

      {report.verdict.edge || report.verdict.our_edge || report.verdict.attack_this ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {report.verdict.edge && (
            <Card className="p-4">
              <p className="text-[10px] font-bold uppercase text-text-secondary">Projected edge</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{report.verdict.edge.team}</p>
              <p className="mt-1 text-xs text-text-secondary">{report.verdict.edge.note}</p>
            </Card>
          )}
          {report.verdict.our_edge && (
            <Card className="p-4">
              <p className="text-[10px] font-bold uppercase text-text-secondary">Our edge</p>
              <p className="mt-1 text-sm font-bold text-text-primary">{report.verdict.our_edge.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{report.verdict.our_edge.note}</p>
            </Card>
          )}
          {report.verdict.attack_this && (
            <Card className="p-4">
              <p className="text-[10px] font-bold uppercase text-text-secondary">Attack this</p>
              <p className="mt-1 text-sm font-bold text-text-primary">{report.verdict.attack_this.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{report.verdict.attack_this.note}</p>
            </Card>
          )}
        </div>
      ) : null}

      {report.executive_summary.length > 0 && (
        <AIInsight title="Executive summary" className="mb-6">
          <ul className="space-y-1.5">
            {report.executive_summary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </AIInsight>
      )}

      {report.star_dependency && (report.star_dependency.home || report.star_dependency.away) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {report.star_dependency.home && (
            <Card className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-brand-blue">{report.home_name}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Top scorers <b className="text-text-primary">{report.star_dependency.home.names.join(" & ")}</b> account for{" "}
                <b className="text-text-primary">{(report.star_dependency.home.points_share * 100).toFixed(0)}%</b> of team points.
              </p>
            </Card>
          )}
          {report.star_dependency.away && (
            <Card className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-brand-orange">{report.away_name}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Top scorers <b className="text-text-primary">{report.star_dependency.away.names.join(" & ")}</b> account for{" "}
                <b className="text-text-primary">{(report.star_dependency.away.points_share * 100).toFixed(0)}%</b> of team points.
              </p>
            </Card>
          )}
        </div>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">Matchup snapshot</h3>
          <ComparisonTable rows={report.snapshot_rows} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">Style comparison</h3>
          <ComparisonTable rows={report.style_rows} />
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {matchupProfileChart && (
          <Card className="p-5">
            <CoachChartView chart={matchupProfileChart} />
          </Card>
        )}
        {shootingWinrateChart && (
          <Card className="p-5">
            <CoachChartView chart={shootingWinrateChart} />
          </Card>
        )}
        {efficiencyChart && (
          <Card className="p-5">
            <CoachChartView chart={efficiencyChart} />
          </Card>
        )}
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">{report.home_name} form</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MetricCard label="Form" value={report.form_summary.home.label} />
            <MetricCard
              label="Win rate (last 5)"
              value={report.form_summary.home.win_rate != null ? `${(report.form_summary.home.win_rate * 100).toFixed(0)}%` : "-"}
            />
          </div>
          {formChartHome && <CoachChartView chart={formChartHome} />}
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary">{report.away_name} form</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MetricCard label="Form" value={report.form_summary.away.label} />
            <MetricCard
              label="Win rate (last 5)"
              value={report.form_summary.away.win_rate != null ? `${(report.form_summary.away.win_rate * 100).toFixed(0)}%` : "-"}
            />
          </div>
          {formChartAway && <CoachChartView chart={formChartAway} />}
        </Card>
      </div>

      {recentVsSeasonChart && (
        <Card className="mb-6 p-5">
          <CoachChartView chart={recentVsSeasonChart} />
        </Card>
      )}

      <Card className="mb-6 p-5">
        <h3 className="text-sm font-bold text-text-primary">Opponent profile · {report.away_name}</h3>
        {report.opponent_profile.traits.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {report.opponent_profile.traits.map((trait) => (
              <DataPill key={trait}>{trait}</DataPill>
            ))}
          </div>
        )}
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-secondary">Offensive</h4>
            <OpponentProfileList rows={report.opponent_profile.offensive} />
          </div>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-secondary">Defensive</h4>
            <OpponentProfileList rows={report.opponent_profile.defensive} />
          </div>
        </div>
        {report.opponent_profile.vulnerabilities.length > 0 && (
          <div className="mt-4 rounded-lg bg-danger/5 p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-error">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Vulnerabilities
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-text-secondary">
              {report.opponent_profile.vulnerabilities.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}
        {(opponentVsLeagueChart || homeAwayChart) && (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {opponentVsLeagueChart && <CoachChartView chart={opponentVsLeagueChart} />}
            {homeAwayChart && <CoachChartView chart={homeAwayChart} />}
          </div>
        )}
        {report.opponent_profile.home_away && report.opponent_profile.home_away.home_win_rate != null && (
          <p className="mt-4 text-xs text-text-secondary">
            Home/away split: <b className="text-text-primary">home</b>{" "}
            {report.opponent_profile.home_away.home_points_for?.toFixed(1)} for / {report.opponent_profile.home_away.home_points_against?.toFixed(1)} against,{" "}
            {((report.opponent_profile.home_away.home_win_rate ?? 0) * 100).toFixed(0)}% wins ({report.opponent_profile.home_away.home_games} games)
            &nbsp;•&nbsp; <b className="text-text-primary">away</b>{" "}
            {report.opponent_profile.home_away.away_points_for?.toFixed(1)} for / {report.opponent_profile.home_away.away_points_against?.toFixed(1)} against,{" "}
            {((report.opponent_profile.home_away.away_win_rate ?? 0) * 100).toFixed(0)}% wins ({report.opponent_profile.home_away.away_games} games).
          </p>
        )}
      </Card>

      {report.key_threats.length > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Key threats</h3>
          {playerComparisonChart && <CoachChartView chart={playerComparisonChart} />}
          <div className="mt-3 space-y-3">
            {report.key_threats.map((threat, i) => (
              <div key={`${threat.player_name}-${threat.role}-${i}`} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-text-primary">
                    {threat.player_name} <span className="font-normal text-text-secondary">· {threat.role}</span>
                  </p>
                  <span className="text-xs text-text-muted">{threat.position}</span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{threat.evidence}</p>
                {threat.form_note && <p className="mt-1 text-xs font-medium text-brand-blue">{threat.form_note}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {(["home", "away"] as const).map((side) => (
          <Card key={side} className="p-5">
            <h3 className="text-sm font-bold text-text-primary">
              {side === "home" ? report.home_name : report.away_name} lineup
            </h3>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {report.lineups[side].map((row, i) => (
                  <tr key={`${row.player}-${i}`} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 text-text-primary">{row.player}</td>
                    <td className="py-2 px-2 text-text-secondary">{row.position}</td>
                    <td
                      className={`py-2 pl-3 text-right text-xs ${
                        row.status_class === "risk" ? "text-error" : row.status_class === "warn" ? "text-warning" : "text-text-muted"
                      }`}
                    >
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      {report.key_players_table.length > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="text-sm font-bold text-text-primary">Key players · watch list</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                  <th className="py-2 pr-4">Team</th>
                  <th className="py-2 pr-4">Player</th>
                  <th className="py-2 pr-4">Pos</th>
                  <th className="py-2 pr-4 text-right">PPG</th>
                  <th className="py-2 pr-4 text-right">Eval</th>
                  <th className="py-2 pr-4 text-right">GP</th>
                  <th className="py-2">Status / Risk</th>
                </tr>
              </thead>
              <tbody>
                {report.key_players_table.map((row, i) => (
                  <tr key={`${row.team}-${row.player}-${i}`} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                    <td className="py-2 pr-4 text-text-secondary">{row.team}</td>
                    <td className="py-2 pr-4 font-semibold text-text-primary">{row.player}</td>
                    <td className="py-2 pr-4 text-text-secondary">{row.position}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{row.ppg}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{row.evaluation}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{row.games}</td>
                    <td
                      className={`py-2 text-xs ${
                        row.status_class === "risk" ? "text-error" : row.status_class === "warn" ? "text-warning" : "text-text-muted"
                      }`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {([report.home_name, report.away_name] as const).map((teamName) => {
          const players = report.rosters[teamName] ?? [];
          if (players.length === 0) return null;
          return (
            <Card key={teamName} className="p-5">
              <h3 className="text-sm font-bold text-text-primary">Full roster efficiency · {teamName}</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                      <th className="py-2 pr-4">Player</th>
                      <th className="py-2 pr-4">Pos</th>
                      <th className="py-2 pr-4 text-right">GP</th>
                      <th className="py-2 pr-4 text-right">PPG</th>
                      <th className="py-2 pr-4 text-right">RPG</th>
                      <th className="py-2 pr-4 text-right">APG</th>
                      <th className="py-2 text-right">Eval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr key={p.player_id} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                        <td className="py-2 pr-4 font-semibold text-text-primary">{p.name}</td>
                        <td className="py-2 pr-4 text-text-secondary">{p.position}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-secondary">{p.games_played}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{p.avg_points.toFixed(1)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{p.avg_rebounds.toFixed(1)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{p.avg_assists.toFixed(1)}</td>
                        <td className="py-2 text-right tabular-nums font-bold text-brand-blue">{p.avg_eval.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 space-y-6">
        <TacticalCards title="Tactical opportunities" icon={Target} cards={report.tactical_opportunities} />
        <TacticalCards title="Defensive priorities" icon={ShieldAlert} cards={report.defensive_priorities} />
        <TacticalCards title="Player & matchup considerations" icon={Swords} cards={report.matchup_considerations} />
        <TacticalCards title="Practice focus" icon={TrendingUp} cards={report.practice_focus} />
      </div>

      {(report.strengths.length > 0 || report.risks.length > 0) && (
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
          {report.risks.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-error">Risks</h3>
              <div className="mt-3 space-y-3">
                {report.risks.map((r, i) => (
                  <div key={i} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-bold text-text-primary">{r.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{r.evidence}</p>
                    <p className="mt-1 text-xs font-medium text-brand-blue">→ {r.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {report.coaching_priorities.length > 0 && (
        <AIInsight title="Coaching priorities">
          <ol className="space-y-3">
            {report.coaching_priorities.map(([priority, why, action], i) => (
              <li key={i} className="flex gap-3 border-b border-border pb-3 text-sm last:border-0">
                <b className="text-brand-blue">{String(i + 1).padStart(2, "0")}</b>
                <div>
                  <p className="font-bold text-text-primary">{priority}</p>
                  <p className="text-xs text-text-secondary">{why}</p>
                  <p className="text-xs font-medium text-brand-blue">→ {action}</p>
                </div>
              </li>
            ))}
          </ol>
        </AIInsight>
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

      {!report.snapshot_rows.length && !report.tactical_opportunities.length && (
        <EmptyState
          icon={<Swords className="h-6 w-6" aria-hidden="true" />}
          title="Limited data for this matchup"
          description="Not enough game data was available to build a full briefing for these two teams."
        />
      )}
    </AppShell>
  );
}
