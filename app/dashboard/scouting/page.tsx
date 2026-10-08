"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Download, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AIBadge, Button, Card, Checkbox, MetricCard, Select, ShotChart, Spinner } from "@/components/ui";
import { logActivity } from "@/lib/activity-log";
import { CoachChartView } from "@/components/coach/CoachChartView";
import { MarkdownContent } from "@/components/coach/MarkdownContent";
import { SourcesList } from "@/components/coach/SourcesList";
import {
  ApiError,
  downloadScoutingPdf,
  downloadScoutingDocx,
  fetchPlayers,
  generateScoutingReport,
  splitMarkdownSections,
  type ScoutingPlayer,
  type ScoutingReportResponse,
} from "@/lib/api-client";

function formatStat(value: unknown): string {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(1) : "-";
}

function formatPct(value: unknown): string {
  const num = Number(value);
  return Number.isFinite(num) ? `${Math.round(num * 100)}%` : "-";
}

// Efficiency strings arrive as e.g. "37.8% (28/74)" -- MetricCard renders
// `value` at a large fixed size with no wrapping, so the "(28/74)" part is
// split off into its small `detail` line instead of overflowing the card.
function splitStat(value: string | undefined): { value: string; detail?: string } {
  if (!value) return { value: "-" };
  const match = value.match(/^(.*?)\s*(\(.*\))$/);
  return match ? { value: match[1], detail: match[2] } : { value };
}

const included = [
  "Player profile",
  "Performance analysis",
  "Shot profile",
  "SWOT analysis",
  "Development plan",
];

export default function ScoutingPage() {
  const [players, setPlayers] = useState<ScoutingPlayer[]>([]);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [searchWebForMissingInfo, setSearchWebForMissingInfo] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScoutingReportResponse | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "docx">("pdf");

  useEffect(() => {
    fetchPlayers()
      .then((list) => {
        setPlayers(list);
        setSelectedPlayerId((current) => current ?? list[0]?.id ?? null);
      })
      .catch(() => setPlayersError("Could not load the player list. Is the API server running?"));
  }, []);

  const generate = async () => {
    if (selectedPlayerId == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateScoutingReport({
        player_id: selectedPlayerId,
        custom_goal: customGoal,
        search_web_for_missing_info: searchWebForMissingInfo,
      });
      setReport(data);
      logActivity("Scouting report generated", `${data.player.first_name} ${data.player.last_name}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `The coach backend returned an error (${err.status}).`
          : "Could not reach the coach backend. Is the API server running?",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!report) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const blob =
        downloadFormat === "pdf"
          ? await downloadScoutingPdf(
              report.player.id,
              report.report.summary ?? "",
              report.report.analysis ?? "",
              report.identity_info,
              report.web_found_fields,
              report.web_sources_caption,
              report.player_news,
            )
          : await downloadScoutingDocx(
              report.player.id,
              report.report.summary ?? "",
              report.report.analysis ?? "",
              report.identity_info,
              report.web_found_fields,
              report.web_sources_caption,
              report.player_news,
            );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.player.first_name}_${report.player.last_name}_development_report.${downloadFormat}`;
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

  const sections = useMemo(
    () => (report?.report.analysis ? splitMarkdownSections(report.report.analysis) : []),
    [report],
  );
  const swotSections = sections.filter((s) => s.heading.toLowerCase() !== "development plan");
  const devPlanSection = sections.find((s) => s.heading.toLowerCase() === "development plan");
  const devPlanItems = devPlanSection
    ? devPlanSection.body
        .split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
    : [];

  if (!report) {
    return (
      <AppShell title="Scouting" breadcrumb="Game">
        <PageHeader
          title="Player Development Report"
          description="Build a coach-ready player report from verified performance data and AI-assisted analysis."
        />
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary">Report setup</h3>
            <div className="mt-6 space-y-5">
              {playersError ? (
                <p className="text-sm text-error">{playersError}</p>
              ) : (
                <Select
                  label="Player"
                  value={selectedPlayerId ?? ""}
                  onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} {p.position ? `(${p.position})` : ""}
                    </option>
                  ))}
                </Select>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-text-primary">
                  Additional instructions (optional)
                </span>
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder='e.g. "Focus on her readiness for a starting role next season."'
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15"
                />
              </label>
              <div>
                <Checkbox
                  checked={searchWebForMissingInfo}
                  onChange={(e) => setSearchWebForMissingInfo(e.target.checked)}
                  label="🌐 Also search the web for missing info & recent news"
                />
                <p className="mt-1.5 pl-[26px] text-xs text-text-secondary">
                  Fills missing Player Info fields (nationality, birth date, height, position) and looks up recent
                  news, contract status, and transfer rumors. Never overrides a real database value - every
                  web-sourced result is clearly marked as unverified, with a link to where it came from.
                </p>
              </div>
              <Button type="button" fullWidth size="lg" onClick={() => void generate()} disabled={loading || selectedPlayerId == null}>
                {loading ? (
                  <>
                    <Spinner />
                    XamCoach is analyzing
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Generate Report
                  </>
                )}
              </Button>
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-3 rounded-lg bg-intelligence p-4 text-xs text-text-secondary">
                  <Spinner />
                  <div className="space-y-1">
                    <p>Checking game statistics</p>
                    <p>Reviewing player trends</p>
                    <p>Consulting basketball knowledge</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-bold text-text-primary">Your report will include</h3>
            <div className="mt-4 space-y-3">
              {included.map((x) => (
                <div key={x} className="flex items-center gap-3 text-sm text-text-primary">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {x}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const fullName = `${report.player.first_name} ${report.player.last_name}`;
  // player_game_log is most-recent-first; the API already reverses it to
  // chronological (oldest -> newest) for recent_games, matching the trend
  // chart's left-to-right reading and report/scouting_report.py's own
  // _performance_trend_chart call (unreversed). The game-log TABLE below
  // re-reverses it back to newest-first, matching that PDF's own
  // games=list(reversed(recent_games)) table convention.
  const gameLogRows = [...report.recent_games].reverse();

  return (
    <AppShell title="Scouting" breadcrumb="Game">
      <PageHeader
        title="Player Development Report"
        description={`${fullName} · ${report.player.team_name ?? "Team unknown"}`}
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
              New report
            </Button>
          </>
        }
      />

      {pdfError && (
        <div className="mx-auto mb-4 flex max-w-5xl items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {pdfError}
        </div>
      )}

      <article className="mx-auto max-w-5xl rounded-xl border border-border bg-surface shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
        <div className="border-b-4 border-text-primary p-6 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-orange">
            XamCoach Intelligence
          </p>
          <h2 className="mt-4 text-3xl font-bold uppercase text-text-primary">Player Development Report</h2>
          <div className="mt-8 flex items-end justify-between">
            <div className="flex items-center gap-4">
              {report.player.photo_base64 && (
                <img
                  src={`data:image/jpeg;base64,${report.player.photo_base64}`}
                  alt={fullName}
                  className="h-16 w-16 rounded-lg border border-border object-cover"
                />
              )}
              <div>
                <p className="text-xl font-bold text-text-primary">{fullName}</p>
                <p className="text-sm text-text-secondary">
                  {report.player.position ?? "N/A"} · {report.player.team_name ?? "Team unknown"}
                </p>
              </div>
            </div>
            <p className="text-right text-xs text-text-secondary">
              CONFIDENTIAL
              <br />
              COACHING STAFF
            </p>
          </div>
        </div>

        <div className="space-y-10 p-6 md:p-10">
          {report.report.summary && (
            <p className="rounded-lg bg-intelligence p-4 text-sm italic text-text-secondary">{report.report.summary}</p>
          )}

          <section>
            <ReportTitle n="01" title="Player info" />
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(report.identity_info).map(([field, value]) => (
                  <tr key={field} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                    <td className="py-2 pr-4 font-semibold text-text-primary">{field}</td>
                    <td className="py-2 text-text-secondary">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.web_sources_caption && (
              <p className="mt-2 text-xs italic text-text-secondary">⚠️ {report.web_sources_caption}</p>
            )}
          </section>

          {report.web_found_fields.length > 0 && (
            <section>
              <ReportTitle n="02" title="Web search summary" />
              <p className="mb-3 text-xs text-text-secondary">
                These values were not found in the database - found via web search instead, and are not
                independently verified.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    <th className="py-2 pr-4">Field</th>
                    <th className="py-2 pr-4">Value found</th>
                    <th className="py-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {report.web_found_fields.map((found) => (
                    <tr key={found.field} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                      <td className="py-2 pr-4 font-semibold text-text-primary">{found.field}</td>
                      <td className="py-2 pr-4 text-text-primary">{found.value}</td>
                      <td className="py-2 text-text-secondary">
                        {found.source_url ? (
                          <a
                            href={found.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue underline-offset-2 hover:underline"
                          >
                            {found.source_title || found.source_url}
                          </a>
                        ) : (
                          found.source_title || "Web search"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {report.player_news && (
            <section>
              <ReportTitle n="03" title="Player news & market intelligence" />
              <p className="mb-3 text-xs text-text-secondary">Found via web search - not independently verified.</p>
              <p className="rounded-lg bg-intelligence p-4 text-sm text-text-primary">{report.player_news.summary}</p>
              {report.player_news.sources.length > 0 && (
                <p className="mt-2 text-xs text-text-secondary">
                  Sources:{" "}
                  {report.player_news.sources.map((source, i) => (
                    <span key={source.url}>
                      {i > 0 && "; "}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue underline-offset-2 hover:underline"
                      >
                        {source.title || source.domain}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </section>
          )}

          <section>
            <ReportTitle n="04" title="Performance summary" />
            <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-5">
              <MetricCard label="Games" value={formatStat(report.aggregate?.games_played)} />
              <MetricCard label="PPG" value={formatStat(report.aggregate?.avg_points)} />
              <MetricCard label="RPG" value={formatStat(report.aggregate?.avg_rebounds)} />
              <MetricCard label="APG" value={formatStat(report.aggregate?.avg_assists)} />
              <MetricCard label="Eval" value={formatStat(report.aggregate?.avg_eval)} />
            </div>

            <h4 className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
              Shooting efficiency
            </h4>
            <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-5">
              <MetricCard label="FG%" {...splitStat(report.efficiency?.fg_pct)} />
              <MetricCard label="3P%" {...splitStat(report.efficiency?.three_pct)} />
              <MetricCard label="FT%" {...splitStat(report.efficiency?.ft_pct)} />
              <MetricCard label="eFG%" {...splitStat(report.efficiency?.efg_pct)} />
              <MetricCard label="TS%" {...splitStat(report.efficiency?.ts_pct)} />
            </div>

            {report.percentile && (
              <>
                <h4 className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
                  Percentile rank (vs league)
                </h4>
                <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-6">
                  <MetricCard label="Points" value={formatPct(report.percentile.points_pct)} />
                  <MetricCard label="Rebounds" value={formatPct(report.percentile.rebounds_pct)} />
                  <MetricCard label="Assists" value={formatPct(report.percentile.assists_pct)} />
                  <MetricCard label="Steals" value={formatPct(report.percentile.steals_pct)} />
                  <MetricCard label="Blocks" value={formatPct(report.percentile.blocks_pct)} />
                  <MetricCard label="Eval" value={formatPct(report.percentile.eval_pct)} />
                </div>
              </>
            )}
          </section>

          {swotSections.length > 0 && (
            <section>
              <div className="flex items-center justify-between">
                <ReportTitle n="05" title="SWOT analysis" />
                <AIBadge />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {swotSections.map((section) => (
                  <div key={section.heading} className="rounded-lg border border-intelligence-border bg-intelligence p-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-brand-blue">{section.heading}</h4>
                    <div className="mt-2">
                      <MarkdownContent>{section.body}</MarkdownContent>
                    </div>
                  </div>
                ))}
              </div>
              <SourcesList question={`${fullName} - SWOT analysis`} sources={report.report.sources ?? []} />
            </section>
          )}

          <section>
            <ReportTitle n="06" title="Recent form" />
            {report.recent_games.length > 1 && (
              <CoachChartView
                chart={{
                  type: "line",
                  title: `Last ${report.recent_games.length} games`,
                  x_labels: report.recent_games.map((g) => g.opponent ?? g.scheduled_at ?? ""),
                  series: [
                    { name: "Points", values: report.recent_games.map((g) => g.points ?? 0) },
                    { name: "Rebounds", values: report.recent_games.map((g) => g.rebounds_total ?? 0) },
                    { name: "Assists", values: report.recent_games.map((g) => g.assists ?? 0) },
                  ],
                }}
              />
            )}
            {report.recent_games.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Opponent</th>
                      <th className="py-2 pr-4 text-right">PTS</th>
                      <th className="py-2 pr-4 text-right">REB</th>
                      <th className="py-2 pr-4 text-right">AST</th>
                      <th className="py-2 text-right">FGA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLogRows.map((g, i) => (
                      <tr key={`${g.scheduled_at ?? "game"}-${i}`} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                        <td className="py-2 pr-4 text-text-secondary">{g.scheduled_at ?? "-"}</td>
                        <td className="py-2 pr-4 text-text-primary">{g.opponent ?? "-"}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{g.points ?? "-"}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{g.rebounds_total ?? "-"}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-primary">{g.assists ?? "-"}</td>
                        <td className="py-2 text-right tabular-nums text-text-primary">{g.fga ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <ReportTitle n="07" title="Shot location" />
            <div className="grid gap-5 md:grid-cols-[1fr_0.6fr]">
              <ShotChart compact shots={report.shots} />
              <div className="space-y-3">
                {(
                  [
                    ["Total shots recorded", report.shot_summary?.total],
                    ["Field goal %", report.shot_summary?.fg_pct],
                    ["At the rim", report.shot_summary?.rim],
                    ["Mid-range", report.shot_summary?.mid_range],
                    ["Three-point", report.shot_summary?.three],
                  ] as const
                ).map(([label, value]) =>
                  value != null ? (
                    <div key={label} className="flex justify-between border-b border-border pb-3 text-sm text-text-primary">
                      <span>{label}</span>
                      <b className="tabular-nums">{value}</b>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </section>

          <section>
            <ReportTitle n="08" title="Shot zone breakdown" />
            {report.zone_rows.length > 0 ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <CoachChartView
                    chart={{
                      type: "bar",
                      title: "FG% by zone",
                      x_labels: report.zone_rows.map((z) => z.zone),
                      series: [{ name: "FG%", values: report.zone_rows.map((z) => z.fg_pct) }],
                    }}
                  />
                  <CoachChartView
                    chart={{
                      type: "bar",
                      title: "Frequency by zone",
                      x_labels: report.zone_rows.map((z) => z.zone),
                      series: [{ name: "Freq %", values: report.zone_rows.map((z) => z.freq_pct) }],
                    }}
                  />
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                        <th className="py-2 pr-4">Zone</th>
                        <th className="py-2 pr-4 text-right">Freq.</th>
                        <th className="py-2 pr-4 text-right">M/A (FG%)</th>
                        <th className="py-2 text-right">PPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.zone_rows.map((z) => (
                        <tr key={z.zone} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                          <td className="py-2 pr-4 text-text-primary">{z.zone}</td>
                          <td className="py-2 pr-4 text-right tabular-nums text-text-secondary">{z.freq_pct.toFixed(0)}%</td>
                          <td className="py-2 pr-4 text-right tabular-nums text-text-secondary">
                            {z.made}/{z.attempts} ({z.fg_pct.toFixed(0)}%)
                          </td>
                          <td className="py-2 text-right tabular-nums text-text-secondary">{z.pps.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-text-secondary">No shot data available for this player.</p>
            )}
          </section>

          {report.assist_splits.length > 0 && (
            <section>
              <ReportTitle n="09" title="Assisted / unassisted shooting" />
              <CoachChartView
                chart={{
                  type: "bar",
                  title: "Assisted vs unassisted makes",
                  x_labels: report.assist_splits.map((s) => s.shot_type),
                  series: [
                    { name: "Assisted", values: report.assist_splits.map((s) => s.assisted) },
                    { name: "Unassisted", values: report.assist_splits.map((s) => s.unassisted) },
                  ],
                }}
              />
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                      <th className="py-2 pr-4">Shot type</th>
                      <th className="py-2 pr-4 text-right">Assisted</th>
                      <th className="py-2 text-right">Unassisted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.assist_splits.map((s) => (
                      <tr key={s.shot_type} className="border-b border-border last:border-0 odd:bg-surface-secondary/40">
                        <td className="py-2 pr-4 text-text-primary">{s.shot_type}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-text-secondary">
                          {s.assisted_pct.toFixed(0)}% ({s.assisted})
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">
                          {s.unassisted_pct.toFixed(0)}% ({s.unassisted})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {devPlanItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between">
                <ReportTitle n="10" title="Development plan" />
                <AIBadge />
              </div>
              <ol className="space-y-3">
                {devPlanItems.map((item, i) => (
                  <li key={item} className="flex gap-4 border-b border-border pb-3 text-sm text-text-primary">
                    <b className="text-brand-blue">{String(i + 1).padStart(2, "0")}</b>
                    <div className="flex-1">
                      <MarkdownContent>{item}</MarkdownContent>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </article>
    </AppShell>
  );
}

function ReportTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-xs font-black text-brand-orange">{n}</span>
      <h3 className="text-lg font-bold uppercase tracking-[0.04em] text-text-primary">{title}</h3>
    </div>
  );
}
