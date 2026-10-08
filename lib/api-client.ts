/**
 * Thin fetch wrapper for the FastAPI backend (api/main.py, see that file
 * for how to run it). Every field below mirrors
 * llm/response_formatter.py::CoachResponse.to_dict()'s real, already-stable
 * shape (or the greeting/no-LLM degraded-mode dicts
 * api/routers/ask_coach.py returns) -- optional fields are genuinely absent
 * on some response shapes (e.g. the greeting short-circuit has no
 * `evidence`/`chart`/`tactical_board`), not just possibly-null.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface Citation {
  kind: "book" | "graph" | "statistics" | "health" | "web";
  provenance: string;
  content_snippet: string;
  confidence: number;
  book_title?: string | null;
  chapter?: string | null;
  chunk_id?: string | null;
  excerpt?: string | null;
  page?: string | null;
  /** Web-kind only. */
  title?: string | null;
  url?: string | null;
}

export interface CoachChart {
  type: "line" | "bar";
  title: string;
  x_labels: string[];
  series: { name: string; values: number[] }[];
}

export interface TacticalBoardPayload {
  timeline?: unknown;
  play?: unknown;
  [key: string]: unknown;
}

export interface CoachResponse {
  question?: string;
  summary: string;
  analysis: string;
  recommendations: string[];
  sources: Citation[];
  confidence: number;
  guardrail_warnings: string[];
  errors: string[];
  metrics: Record<string, unknown>;
  chart?: CoachChart | null;
  tactical_board?: TacticalBoardPayload | null;
  needs_clarification?: boolean;
  clarifying_question?: string | null;
  web_search_query?: string;
}

export interface AskCoachRequest {
  question: string;
  session_id: string;
  web_search_enabled?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function askCoach(request: AskCoachRequest): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ask-coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ web_search_enabled: false, ...request }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as CoachResponse;
}

/** A stable per-browser conversation id -- the client-side equivalent of
 * app/state.py::get_session_id() (one UUID per Streamlit session), reused
 * for the lifetime of the tab so agents.supervisor_agent.SupervisorAgent's
 * own server-side memory (keyed by this id) sees a continuous
 * conversation. Stored in sessionStorage (not localStorage): a new tab is a
 * new conversation, same as opening a fresh Streamlit session. */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "xamcoach-session-id";
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

// ---------------------------------------------------------------- Scouting

export interface ScoutingPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string | null;
  height_cm: string | null;
  weight_kg: string | null;
  nationality: string | null;
  birth_date: string | null;
  dominant_hand: string | null;
  profile_url: string | null;
}

export interface ScoutingReportRequest {
  player_id: number;
  custom_goal?: string;
  /** Off by default -- costs a real web search + LLM call. Drives two
   * things: filling missing Player Info fields (retrieval/
   * player_web_lookup.py) AND a player news/contract/transfer-rumors
   * summary (retrieval/player_news_lookup.py) -- the second has no
   * Streamlit-page equivalent, only this API + frontend + the shared PDF. */
  search_web_for_missing_info?: boolean;
}

export interface ScoutingWebFoundField {
  field: string;
  value: string;
  source_url: string | null;
  source_title: string | null;
}

export interface ScoutingPlayerNewsSource {
  title: string;
  url: string;
  domain: string;
}

export interface ScoutingPlayerNews {
  summary: string;
  sources: ScoutingPlayerNewsSource[];
}

export interface ScoutingRecentGame {
  scheduled_at: string | null;
  opponent: string | null;
  points: number | null;
  rebounds_total: number | null;
  assists: number | null;
  fga: number | null;
}

export interface ScoutingAssistSplit {
  shot_type: string;
  made: number;
  assisted: number;
  unassisted: number;
  assisted_pct: number;
  unassisted_pct: number;
}

export interface ScoutingReportResponse {
  player: {
    id: number;
    first_name: string;
    last_name: string;
    position: string | null;
    team_name: string | null;
    photo_base64: string | null;
  };
  /** When the web lookup found something, values for the fields it filled
   * carry a "(web, unverified)" suffix -- see web_found_fields/
   * web_sources_caption below for the fuller breakdown. */
  identity_info: Record<string, string>;
  web_found_fields: ScoutingWebFoundField[];
  web_sources_caption: string | null;
  /** Recent news / contract status / transfer rumors, found via web search
   * + LLM summary when the lookup was opted into -- independent of
   * web_found_fields above (that one only ever fills missing Player Info
   * fields; this is always searched when opted in, DB-complete or not). */
  player_news: ScoutingPlayerNews | null;
  aggregate: Record<string, unknown> | null;
  percentile: Record<string, unknown> | null;
  efficiency: Record<string, string>;
  shot_summary: Record<string, string>;
  zone_rows: { zone: string; freq_pct: number; made: number; attempts: number; fg_pct: number; pps: number; color: string }[];
  assist_splits: ScoutingAssistSplit[];
  shots: { x: number; y: number; made: boolean }[];
  recent_games: ScoutingRecentGame[];
  report: {
    summary?: string;
    analysis?: string;
    recommendations?: string[];
    sources?: Citation[];
  };
}

export async function fetchPlayers(): Promise<ScoutingPlayer[]> {
  const response = await fetch(`${API_BASE_URL}/api/players`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as ScoutingPlayer[];
}

export async function generateScoutingReport(request: ScoutingReportRequest): Promise<ScoutingReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scouting/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as ScoutingReportResponse;
}

/** The REAL backend PDF (report/scouting_report.py::build_report -- the
 * exact same function app/pages/scouting.py's own "Download report (PDF)"
 * button calls), not a browser print-to-PDF of this page. `summary`/
 * `analysis` are the exact text generateScoutingReport() already returned
 * for this player, passed back so the PDF's SWOT/Development Plan text is
 * guaranteed to match what's on screen and downloading never costs a
 * second LLM call. */
export async function downloadScoutingPdf(
  playerId: number,
  summary: string,
  analysis: string,
  identityInfo?: Record<string, string>,
  webFoundFields?: ScoutingWebFoundField[],
  webSourcesCaption?: string | null,
  playerNews?: ScoutingPlayerNews | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/scouting/report/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      summary,
      analysis,
      identity_info: identityInfo ?? null,
      web_found_fields: webFoundFields ?? [],
      web_sources_caption: webSourcesCaption ?? "",
      player_news: playerNews ?? null,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

/** Download DOCX version of the scouting report with the same content as PDF. */
export async function downloadScoutingDocx(
  playerId: number,
  summary: string,
  analysis: string,
  identityInfo?: Record<string, string>,
  webFoundFields?: ScoutingWebFoundField[],
  webSourcesCaption?: string | null,
  playerNews?: ScoutingPlayerNews | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/scouting/report/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      summary,
      analysis,
      identity_info: identityInfo ?? null,
      web_found_fields: webFoundFields ?? [],
      web_sources_caption: webSourcesCaption ?? "",
      player_news: playerNews ?? null,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

// ------------------------------------------------------------- Pre-Match

export interface PreMatchTeam {
  id: number;
  name: string;
  short_name: string | null;
  city: string | null;
  country: string | null;
  founded_year: number | null;
}

export interface PreMatchReportRequest {
  team_a_id: number;
  team_b_id: number;
  mode: "tactical_briefing" | "deep_analysis";
}

export interface ComparisonRow {
  label: string;
  home: string;
  away: string;
  read: string;
  read_class: "us" | "opp" | "neu";
  home_hi: boolean;
  away_hi: boolean;
}

export interface TacticalCard {
  title: string;
  fact: string;
  action: string;
}

export interface OpponentProfileRow {
  label: string;
  value: string;
  league_value: string;
  direction: "up" | "down" | "flat";
}

export interface PreMatchRosterPlayer {
  player_id: number;
  name: string;
  position: string;
  games_played: number;
  avg_points: number;
  avg_rebounds: number;
  avg_assists: number;
  avg_steals: number;
  avg_blocks: number;
  avg_turnovers: number;
  avg_plus_minus: number;
  avg_eval: number;
  efg_pct: number | null;
  ts_pct: number | null;
  ast_to: number | null;
  ppm: number | null;
  offensive_efficiency: number | null;
  defensive_impact: number;
}

export interface PreMatchReportResponse {
  home_name: string;
  away_name: string;
  meta: {
    type: string;
    competition_season: string;
    fixture: string;
    data_cutoff: string;
    form_window: string;
    generated: string;
  };
  verdict: {
    edge: { team: string; note: string } | null;
    our_edge: { title: string; note: string } | null;
    attack_this: { title: string; note: string } | null;
  };
  executive_summary: string[];
  star_dependency: {
    home: { names: string[]; points_share: number } | null;
    away: { names: string[]; points_share: number } | null;
    home_name: string;
    away_name: string;
  } | null;
  snapshot_rows: ComparisonRow[];
  style_rows: ComparisonRow[];
  raw: {
    matchup_profile: { labels: string[]; home: number[]; away: number[] };
    shooting_winrate: { labels: string[]; home: number[]; away: number[] };
    efficiency: { labels: string[]; home: number[]; away: number[] };
    form_home: { labels: string[]; values: number[] };
    form_away: { labels: string[]; values: number[] };
    player_comparison: { names: string[]; ppg: number[]; rpg: number[]; apg: number[] };
    opp_vs_league: { labels: string[]; opponent: number[]; league: number[] };
  };
  form_summary: {
    home: { label: string; point_diff_last5: number | null; point_diff_season: number | null; win_rate: number | null };
    away: { label: string; point_diff_last5: number | null; point_diff_season: number | null; win_rate: number | null };
  };
  opponent_profile: {
    offensive: OpponentProfileRow[];
    defensive: OpponentProfileRow[];
    traits: string[];
    vulnerabilities: string[];
    home_away: Record<string, number> | null;
  };
  key_threats: {
    role: string;
    player_name: string;
    position: string;
    games_played: number;
    evidence: string;
    form_note: string | null;
  }[];
  lineups: {
    home: { player: string; position: string; note: string; status_class: "ok" | "warn" | "risk" }[];
    away: { player: string; position: string; note: string; status_class: "ok" | "warn" | "risk" }[];
  };
  key_players_table: {
    team: string;
    player: string;
    position: string;
    ppg: string;
    evaluation: string;
    games: string;
    status: string;
    status_class: "ok" | "warn" | "risk";
  }[];
  /** Keyed by team name (home_name / away_name), not "home"/"away". */
  rosters: Record<string, PreMatchRosterPlayer[]>;
  tactical_opportunities: TacticalCard[];
  defensive_priorities: TacticalCard[];
  matchup_considerations: TacticalCard[];
  practice_focus: TacticalCard[];
  strengths: { title: string; evidence: string; why_it_matters: string; implication: string; action: string }[];
  risks: { title: string; evidence: string; why_it_matters: string; implication: string; action: string }[];
  /** Each tuple is [priority, why, action] -- app/reporting.py::parse_priority_line. */
  coaching_priorities: [string, string, string][];
  reliability: Record<string, string[]>;
  metric_definitions: [string, string][];
  /** Raw LLM text this exact response was built from -- pass straight back
   * to downloadPreMatchPdf() so the PDF matches without a second LLM call. */
  llm_response: { summary: string; analysis: string; recommendations: string[] };
}

export async function fetchTeams(): Promise<PreMatchTeam[]> {
  const response = await fetch(`${API_BASE_URL}/api/teams`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as PreMatchTeam[];
}

export async function generatePreMatchReport(request: PreMatchReportRequest): Promise<PreMatchReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/pre-match/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as PreMatchReportResponse;
}

/** The REAL backend PDF (report/pre_match_report.py::build_report), not a
 * browser print of this page. summary/analysis/recommendations are the
 * exact text generatePreMatchReport() already returned, passed back so the
 * PDF matches what's on screen and downloading it never costs a second
 * LLM call. */
export async function downloadPreMatchPdf(
  teamAId: number, teamBId: number, summary: string, analysis: string, recommendations: string[],
  finalRecommendations?: CoachResponse | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/pre-match/report/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_a_id: teamAId, team_b_id: teamBId, summary, analysis, recommendations,
      final_recommendations_summary: finalRecommendations?.summary ?? "",
      final_recommendations_analysis: finalRecommendations?.analysis ?? "",
      final_recommendations: finalRecommendations?.recommendations ?? [],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

/** Download DOCX version of the pre-match report with the same content as PDF. */
export async function downloadPreMatchDocx(
  teamAId: number, teamBId: number, summary: string, analysis: string, recommendations: string[],
  finalRecommendations?: CoachResponse | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/pre-match/report/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_a_id: teamAId, team_b_id: teamBId, summary, analysis, recommendations,
      final_recommendations_summary: finalRecommendations?.summary ?? "",
      final_recommendations_analysis: finalRecommendations?.analysis ?? "",
      final_recommendations: finalRecommendations?.recommendations ?? [],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

/** A SECOND, explicitly opt-in LLM call -- synthesizes the already-
 * generated report (summary/analysis, passed back so it's never
 * regenerated) into a short, prioritized final recommendations list,
 * same REPORT_MODE_FINAL_RECOMMENDATIONS mode Team Analysis' "Complete
 * Analysis" button uses. Reuses CoachResponse's shape (CoachAnswer
 * already renders it). */
export async function generatePreMatchFinalRecommendations(
  teamAId: number, teamBId: number, summary: string, analysis: string,
): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/pre-match/report/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_a_id: teamAId, team_b_id: teamBId, summary, analysis }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as CoachResponse;
}

// ------------------------------------------------------------- Post-Match

export interface PostMatchGame {
  game_id: number;
  scheduled_at: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: number | null;
  away_team_id: number | null;
  home_team: string;
  away_team: string;
}

export interface PostMatchReportRequest {
  game_id: number;
  mode: "analyze" | "deep_analysis";
}

export interface PostMatchPlayerMetrics {
  player_id: number;
  name: string;
  position: string;
  minutes: number;
  points: number;
  rebounds_total: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plus_minus: number;
  eval_rating: number;
  fgm: number;
  fga: number;
  three_pm: number;
  three_pa: number;
  efg_pct: number | null;
  ts_pct: number | null;
  ast_to: number | null;
  ppm: number | null;
  rebound_contribution: number | null;
  usg_pct: number | null;
  pie: number | null;
  oreb_pct: number | null;
  dreb_pct: number | null;
  offensive_efficiency: number | null;
  defensive_impact: number;
}

export interface PostMatchReportResponse {
  home_name: string;
  away_name: string;
  meta: {
    type: string;
    competition_season: string;
    fixture: string;
    data_cutoff: string;
    generated: string;
  };
  result: { home_score: number; away_score: number; my_team_name: string; label: "WIN" | "LOSS" | "TIE"; margin: number };
  executive_summary: string[];
  scoring_rows: ComparisonRow[];
  rebounding_rows: ComparisonRow[];
  advanced_rows: ComparisonRow[];
  raw: { period_scores: { label: string; home_points: number; away_points: number }[] };
  scoring_runs: Record<string, number>;
  event_style_metrics: string[];
  key_players_table: {
    team: string;
    player: string;
    position: string;
    points: number;
    rebounds: number;
    assists: number;
    evaluation: number;
  }[];
  roster: {
    columns: [string, string][];
    team_name: string;
    players: PostMatchPlayerMetrics[];
  };
  team_strengths: string[];
  team_weaknesses: string[];
  star_dependency_text: string | null;
  what_worked: TacticalCard[];
  tactical_observations: TacticalCard[];
  player_performance: TacticalCard[];
  strengths: { title: string; evidence: string; why_it_matters: string; implication: string; action: string }[];
  weaknesses: { title: string; evidence: string; why_it_matters: string; implication: string; action: string }[];
  coaching_takeaways: [string, string, string][];
  reliability: Record<string, string[]>;
  metric_definitions: [string, string][];
  /** Raw LLM text this exact response was built from -- pass straight back
   * to downloadPostMatchPdf() so the PDF matches without a second LLM call. */
  llm_response: { summary: string; analysis: string; recommendations: string[] };
}

export async function fetchGames(limit = 50): Promise<PostMatchGame[]> {
  const response = await fetch(`${API_BASE_URL}/api/games?limit=${limit}`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as PostMatchGame[];
}

/** Backs the Post-Match picker's "My team" -> "Opponent" -> "Game" flow --
 * once both teams are chosen, this narrows the game picker to just their
 * real meetings instead of the whole league's games. */
export async function fetchGamesBetween(teamAId: number, teamBId: number): Promise<PostMatchGame[]> {
  const response = await fetch(`${API_BASE_URL}/api/games/between?team_a_id=${teamAId}&team_b_id=${teamBId}`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as PostMatchGame[];
}

export async function generatePostMatchReport(request: PostMatchReportRequest): Promise<PostMatchReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/post-match/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as PostMatchReportResponse;
}

/** The REAL backend PDF (report/post_match_report.py::build_report), not a
 * browser print of this page. See downloadPreMatchPdf's own docstring for
 * why summary/analysis/recommendations are passed back rather than
 * regenerated. */
export async function downloadPostMatchPdf(
  gameId: number, mode: "analyze" | "deep_analysis", summary: string, analysis: string, recommendations: string[],
  finalRecommendations?: CoachResponse | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/post-match/report/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_id: gameId, mode, summary, analysis, recommendations,
      final_recommendations_summary: finalRecommendations?.summary ?? "",
      final_recommendations_analysis: finalRecommendations?.analysis ?? "",
      final_recommendations: finalRecommendations?.recommendations ?? [],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

/** Download DOCX version of the post-match report with the same content as PDF. */
export async function downloadPostMatchDocx(
  gameId: number, mode: "analyze" | "deep_analysis", summary: string, analysis: string, recommendations: string[],
  finalRecommendations?: CoachResponse | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/post-match/report/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_id: gameId, mode, summary, analysis, recommendations,
      final_recommendations_summary: finalRecommendations?.summary ?? "",
      final_recommendations_analysis: finalRecommendations?.analysis ?? "",
      final_recommendations: finalRecommendations?.recommendations ?? [],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

/** A SECOND, explicitly opt-in LLM call -- same REPORT_MODE_FINAL_
 * RECOMMENDATIONS synthesis as generatePreMatchFinalRecommendations
 * above, applied to the already-generated Post-Match report. */
export async function generatePostMatchFinalRecommendations(
  gameId: number, mode: "analyze" | "deep_analysis", summary: string, analysis: string,
): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/post-match/report/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, mode, summary, analysis }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as CoachResponse;
}

// ---------------------------------------------------------- Player Analysis

export interface StatTrend {
  metric: string;
  window_avg: number;
  season_avg: number;
  delta: number;
  direction: "up" | "down" | "flat";
}

export interface ShootingSplitRow {
  label: string;
  window: string;
  window_pct: number | null;
  season: string;
  season_pct: number | null;
}

export interface FormReport {
  games_analyzed: number;
  season_games: number;
  form_label: string;
  form_score: number | null;
  consistency_label: string;
  primary_metric: string;
  trends: StatTrend[];
  shooting: ShootingSplitRow[];
}

export interface ImprovementPriority {
  area: string;
  reason: string;
  evidence_key: string;
  severity: number;
  baseline?: string;
  target?: string;
}

export interface ImprovementPlan {
  subject_name: string;
  objective: string;
  why: string;
  baseline: string;
  target: string;
  actions: string[];
  metrics: string[];
  evaluation_period: string;
}

export interface PlayerProfileResponse {
  player: { id: number; first_name: string; last_name: string; position: string | null; team_name: string | null; photo_base64: string | null };
  /** Nationality/Birth date/Height/Active hand/BasketballReference value/
   * Position, in this fixed order -- app/pages/scouting.py::
   * _compute_player_identity_info, the same identity panel Scouting shows. */
  identity_info: Record<string, string>;
  aggregate: { content: string; data: Record<string, unknown> } | null;
  trend: { content: string; data: Record<string, unknown> } | null;
  health: { content: string; data: Record<string, unknown> } | null;
  form: FormReport;
  percentile: Record<string, number> | null;
  pattern_evidence: { content: string; data: Record<string, unknown> } | null;
  priorities: { subject_name: string; has_sufficient_data: boolean; weaknesses: ImprovementPriority[]; strengths: ImprovementPriority[]; insufficient_data_reason: string | null };
  improvement_plans: Record<string, ImprovementPlan>;
  game_log: {
    date: string | null;
    opponent: string;
    minutes: number;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fgm: number;
    fga: number;
    three_pm: number;
    three_pa: number;
    ftm: number;
    fta: number;
    plus_minus: number;
    eval_rating: number;
  }[];
  shooting_splits: {
    fg: { made: number; attempted: number; pct: number };
    three_p: { made: number; attempted: number; pct: number };
    ft: { made: number; attempted: number; pct: number };
  } | null;
  points_trend: { season_avg: number; games: { game_sequence: number; points: number; opponent: string | null; date: string | null; eval_rating: number | null }[] } | null;
  shots: ShotChartShotForApi[];
  graph_neighbors: { labels: string[]; display_name: string | null; props: Record<string, unknown> }[];
}

interface ShotChartShotForApi {
  x: number;
  y: number;
  made: boolean;
}

export async function fetchPlayerProfile(playerId: number): Promise<PlayerProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/players/${playerId}/profile`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as PlayerProfileResponse;
}

export async function generatePlayerNarrative(playerId: number, priorityArea: string | null): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/players/${playerId}/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priority_area: priorityArea }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as CoachResponse;
}

// ------------------------------------------------------------ Team Analysis

export interface TeamStyleProfile {
  team_id: number;
  games: number;
  team_metrics: Record<string, number>;
  league_metrics: Record<string, number>;
  traits: string[];
}

export interface TeamOverviewResponse {
  team: PreMatchTeam;
  logo_base64: string | null;
  team_stats: { content: string; data: { games: number; points_for: number; points_against: number } } | null;
  team_box_score: Record<string, number> | null;
  team_rhythm: Record<string, number> | null;
  style_profile: TeamStyleProfile | null;
  priorities: { subject_name: string; has_sufficient_data: boolean; weaknesses: ImprovementPriority[]; strengths: ImprovementPriority[]; insufficient_data_reason: string | null };
  roster: {
    id: number;
    first_name: string;
    last_name: string;
    position: string | null;
    height_cm: string | null;
    nationality: string | null;
    age: number | null;
    photo_base64: string | null;
  }[];
  recent_games: { id: number; scheduled_at: string | null; home_score: number | null; away_score: number | null; status: string; home_team: string; away_team: string }[];
  standings: { rank: number; wins: number; losses: number; points: number; games_played: number; competition: string }[];
  calendar_games: {
    date: string | null;
    opponent_name: string;
    opponent_logo_base64: string | null;
    is_home: boolean;
    status: string;
    result: "win" | "loss" | "tie" | null;
    our_score: number | null;
    opponent_score: number | null;
  }[];
}

export interface TeamReportRequest {
  mode: "tactics" | "squad";
}

export interface TeamReportResponse {
  response: CoachResponse;
  style_profile: TeamStyleProfile | null;
}

export async function fetchTeamOverview(teamId: number): Promise<TeamOverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/team-analysis/${teamId}/overview`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as TeamOverviewResponse;
}

export async function generateTeamReport(teamId: number, request: TeamReportRequest): Promise<TeamReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/team-analysis/${teamId}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as TeamReportResponse;
}

// --------------------------------------------------------- Practice Planner

export interface TeamPrioritiesResponse {
  team: PreMatchTeam;
  style_profile: TeamStyleProfile | null;
  has_sufficient_data: boolean;
  insufficient_data_reason: string | null;
  focus_areas: ImprovementPriority[];
}

export interface SessionBlock {
  label: string;
  duration_minutes: number;
  players?: string;
  organization?: string;
  coaching_points?: string[];
  success_criteria?: string;
}

export interface TrainingSession {
  subject_name: string;
  total_duration_minutes: number;
  primary_objective: string;
  primary_rationale: string;
  secondary_objective: string | null;
  secondary_rationale: string | null;
  custom_goal: string | null;
  blocks: SessionBlock[];
  metrics_to_monitor: string[];
}

export interface TeamSessionRequest {
  primary_area?: string | null;
  secondary_area?: string | null;
  session_type?: string | null;
  custom_goal?: string | null;
  duration_minutes: number;
  difficulty: string;
}

export interface TeamSessionResponse {
  primary_objective: string;
  primary_rationale: string;
  secondary_objective: string | null;
  secondary_rationale: string | null;
  training_session: TrainingSession | null;
  unavailable: boolean;
}

export interface TeamNarrativeRequest {
  primary_objective: string;
  primary_rationale: string;
  secondary_objective?: string | null;
  secondary_rationale?: string | null;
  custom_goal?: string | null;
  duration_minutes: number;
  difficulty: string;
}

export interface PlayerPlanRequest {
  goal: string;
  goal_reason?: string | null;
  custom_instructions?: string | null;
  duration_minutes: number;
  difficulty: string;
}

export async function fetchTeamPriorities(teamId: number): Promise<TeamPrioritiesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/practice-planner/team/${teamId}/priorities`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as TeamPrioritiesResponse;
}

export async function generateTeamSession(teamId: number, request: TeamSessionRequest): Promise<TeamSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/practice-planner/team/${teamId}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as TeamSessionResponse;
}

export async function generateTeamPracticeNarrative(teamId: number, request: TeamNarrativeRequest): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/practice-planner/team/${teamId}/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as CoachResponse;
}

export async function generatePlayerPracticePlan(playerId: number, request: PlayerPlanRequest): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/practice-planner/player/${playerId}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as CoachResponse;
}

// -------------------------------------------------------------- Dashboard

export interface SpotlightPlayer {
  name: string;
  ppg: number;
  photo_base64: string | null;
}

export interface SpotlightTeam {
  name: string;
  logo_base64: string | null;
  best_player: SpotlightPlayer | null;
}

export interface MatchupSpotlight {
  scheduled_at: string | null;
  home: SpotlightTeam;
  away: SpotlightTeam;
}

export async function fetchMatchupSpotlights(): Promise<MatchupSpotlight[]> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/matchup-spotlights`);
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as MatchupSpotlight[];
}

/** Splits a markdown string on its own "## " headings into (heading, body)
 * pairs -- the TypeScript equivalent of app/utils.py::split_markdown_sections,
 * used to render the LLM's SWOT/Development Plan analysis text the same way
 * app/pdf_export.py and report/scouting_report.py already parse it
 * server-side. Text before the first "## " heading is dropped, same
 * defensive-guard behavior as the Python version. */
export function splitMarkdownSections(markdown: string): { heading: string; body: string }[] {
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : markdown.length;
    return { heading: match[1].trim(), body: markdown.slice(start, end).trim() };
  });
}
