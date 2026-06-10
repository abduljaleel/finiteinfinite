// Data layer: all Supabase reads/writes for the Lodestar dashboard go through this module.
// Maps DB rows (snake_case) to the UI's existing camelCase types from "@/lib/data/strategy".
//
// Mapping notes:
// - strategy_spaces.thesis        <-> StrategySpace.description
// - games.rationale               <-> Game.description
// - games.market                  stores a JSON payload with the four 1-10 evaluation
//                                 scores (asymmetry, competitiveAdvantage, timeHorizon,
//                                 reversibility) since the schema has no dedicated columns.
// - portfolio_items.allocation_pct <-> PortfolioItem.allocation
// - decision_log.decision         <-> Decision.title
// - decision_log.context          <-> Decision.outcomeNotes
// - strategic_moves               backs the space detail "Moves" tab (no scenarios table).

import { createClient } from "@/lib/supabase/client";
import {
  demoMoves,
  strategySpaces as demoSpaces,
  type Decision,
  type DecisionOutcome,
  type Game,
  type GameStatus,
  type GameType,
  type MoveStatus,
  type PortfolioCategory,
  type PortfolioItem,
  type SpaceStatus,
  type StakesLevel,
  type StrategicMove,
  type StrategySpace,
  type TimeHorizon,
} from "@/lib/data/strategy";

export type { Decision, Game, PortfolioItem, StrategicMove, StrategySpace };

export interface SpaceWithData extends StrategySpace {
  moves: StrategicMove[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export async function getCtx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, full_name, email")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) throw new Error("No organization found for this account");
  return {
    supabase,
    userId: user.id,
    orgId: profile.org_id as string,
    userName: (profile.full_name as string | null) || (profile.email as string | null) || "You",
  };
}

type Ctx = Awaited<ReturnType<typeof getCtx>>;

// ---------------------------------------------------------------------------
// Row types (DB shape)
// ---------------------------------------------------------------------------

interface SpaceRow {
  id: string;
  org_id: string;
  name: string;
  time_horizon: string | null;
  status: string | null;
  owner_id: string | null;
  thesis: string | null;
  created_at: string;
}

interface GameRow {
  id: string;
  strategy_space_id: string;
  name: string;
  game_type: string | null;
  market: string | null;
  stakes: string | null;
  status: string | null;
  rationale: string | null;
}

interface MoveRow {
  id: string;
  strategy_space_id: string;
  game_id: string | null;
  title: string;
  move_type: string | null;
  status: string | null;
  deadline: string | null;
  owner_id: string | null;
  outcome: string | null;
}

interface PortfolioRow {
  id: string;
  strategy_space_id: string;
  name: string;
  category: string | null;
  allocation_pct: number | string | null;
  confidence: number | null;
}

interface DecisionRow {
  id: string;
  strategy_space_id: string;
  decision: string | null;
  context: string | null;
  alternatives_considered: unknown;
  rationale: string | null;
  decided_at: string | null;
  outcome: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mappers (DB -> UI types)
// ---------------------------------------------------------------------------

interface GameScores {
  asymmetry: number;
  competitiveAdvantage: number;
  timeHorizon: number;
  reversibility: number;
}

const DEFAULT_SCORES: GameScores = { asymmetry: 5, competitiveAdvantage: 5, timeHorizon: 5, reversibility: 5 };

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function parseScores(market: string | null): GameScores {
  if (!market) return { ...DEFAULT_SCORES };
  try {
    const obj = JSON.parse(market) as Partial<GameScores> | null;
    if (!obj || typeof obj !== "object") return { ...DEFAULT_SCORES };
    return {
      asymmetry: clampScore(obj.asymmetry),
      competitiveAdvantage: clampScore(obj.competitiveAdvantage),
      timeHorizon: clampScore(obj.timeHorizon),
      reversibility: clampScore(obj.reversibility),
    };
  } catch {
    return { ...DEFAULT_SCORES };
  }
}

function encodeScores(scores: GameScores): string {
  return JSON.stringify(scores);
}

function mapGame(row: GameRow): Game {
  const scores = parseScores(row.market);
  return {
    id: row.id,
    name: row.name,
    type: (row.game_type === "infinite" ? "infinite" : "finite") as GameType,
    stakes: (row.stakes ?? "medium") as StakesLevel,
    status: (row.status ?? "active") as GameStatus,
    asymmetry: scores.asymmetry,
    competitiveAdvantage: scores.competitiveAdvantage,
    timeHorizon: scores.timeHorizon,
    reversibility: scores.reversibility,
    description: row.rationale ?? "",
  };
}

function mapPortfolioItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    name: row.name,
    category: (row.category ?? "maintain") as PortfolioCategory,
    allocation: Math.round(Number(row.allocation_pct ?? 0)),
    confidence: row.confidence ?? 0,
  };
}

function mapMove(row: MoveRow, gameNames: Map<string, string>): StrategicMove {
  return {
    id: row.id,
    spaceId: row.strategy_space_id,
    gameId: row.game_id,
    gameName: row.game_id ? gameNames.get(row.game_id) ?? null : null,
    title: row.title,
    moveType: row.move_type ?? "move",
    status: (row.status ?? "planned") as MoveStatus,
    deadline: row.deadline,
    outcome: row.outcome,
  };
}

function mapDecision(row: DecisionRow, spaceNames: Map<string, string>): Decision {
  const alternatives = Array.isArray(row.alternatives_considered)
    ? (row.alternatives_considered as unknown[]).map((a) => String(a))
    : [];
  return {
    id: row.id,
    spaceId: row.strategy_space_id,
    spaceName: spaceNames.get(row.strategy_space_id) ?? "Unknown space",
    title: row.decision ?? "Untitled decision",
    date: row.decided_at ?? row.created_at,
    rationale: row.rationale ?? "",
    alternativesConsidered: alternatives,
    outcome: (row.outcome ?? "pending") as DecisionOutcome,
    outcomeNotes: row.context ?? undefined,
  };
}

function mapSpace(row: SpaceRow, ctx: Pick<Ctx, "userId" | "userName">): SpaceWithData {
  return {
    id: row.id,
    name: row.name,
    timeHorizon: (row.time_horizon ?? "3yr") as TimeHorizon,
    status: (row.status ?? "active") as SpaceStatus,
    owner: row.owner_id && row.owner_id === ctx.userId ? ctx.userName : "Team",
    description: row.thesis ?? "",
    games: [],
    portfolio: [],
    scenarios: [],
    decisions: [],
    moves: [],
  };
}

function throwIfError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`);
}

function composeSpaces(
  ctx: Pick<Ctx, "userId" | "userName">,
  spaceRows: SpaceRow[],
  gameRows: GameRow[],
  moveRows: MoveRow[],
  portfolioRows: PortfolioRow[],
  decisionRows: DecisionRow[]
): SpaceWithData[] {
  const spaces = spaceRows.map((row) => mapSpace(row, ctx));
  const byId = new Map(spaces.map((s) => [s.id, s]));
  const spaceNames = new Map(spaceRows.map((r) => [r.id, r.name]));
  const gameNames = new Map(gameRows.map((r) => [r.id, r.name]));

  for (const row of gameRows) byId.get(row.strategy_space_id)?.games.push(mapGame(row));
  for (const row of moveRows) byId.get(row.strategy_space_id)?.moves.push(mapMove(row, gameNames));
  for (const row of portfolioRows) byId.get(row.strategy_space_id)?.portfolio.push(mapPortfolioItem(row));
  for (const row of decisionRows) byId.get(row.strategy_space_id)?.decisions.push(mapDecision(row, spaceNames));

  return spaces;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchStrategyData(): Promise<SpaceWithData[]> {
  const ctx = await getCtx();
  const { supabase } = ctx;
  const [spacesQ, gamesQ, movesQ, portfolioQ, decisionsQ] = await Promise.all([
    supabase.from("strategy_spaces").select("*").order("created_at", { ascending: true }),
    supabase.from("games").select("*").order("created_at", { ascending: true }),
    supabase.from("strategic_moves").select("*").order("created_at", { ascending: true }),
    supabase.from("portfolio_items").select("*").order("created_at", { ascending: true }),
    supabase.from("decision_log").select("*").order("decided_at", { ascending: false, nullsFirst: false }),
  ]);
  throwIfError(spacesQ.error, "Failed to load strategy spaces");
  throwIfError(gamesQ.error, "Failed to load games");
  throwIfError(movesQ.error, "Failed to load strategic moves");
  throwIfError(portfolioQ.error, "Failed to load portfolio items");
  throwIfError(decisionsQ.error, "Failed to load decision log");

  return composeSpaces(
    ctx,
    (spacesQ.data ?? []) as SpaceRow[],
    (gamesQ.data ?? []) as GameRow[],
    (movesQ.data ?? []) as MoveRow[],
    (portfolioQ.data ?? []) as PortfolioRow[],
    (decisionsQ.data ?? []) as DecisionRow[]
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchSpace(id: string): Promise<SpaceWithData | null> {
  // Non-UUID route params would surface a raw Postgres cast error; treat them
  // as "not found" so the page renders its existing empty state instead.
  if (!UUID_RE.test(id)) return null;
  const ctx = await getCtx();
  const { supabase } = ctx;
  const spaceQ = await supabase.from("strategy_spaces").select("*").eq("id", id).maybeSingle();
  throwIfError(spaceQ.error, "Failed to load strategy space");
  if (!spaceQ.data) return null;

  const [gamesQ, movesQ, portfolioQ, decisionsQ] = await Promise.all([
    supabase.from("games").select("*").eq("strategy_space_id", id).order("created_at", { ascending: true }),
    supabase.from("strategic_moves").select("*").eq("strategy_space_id", id).order("created_at", { ascending: true }),
    supabase.from("portfolio_items").select("*").eq("strategy_space_id", id).order("created_at", { ascending: true }),
    supabase.from("decision_log").select("*").eq("strategy_space_id", id).order("decided_at", { ascending: false, nullsFirst: false }),
  ]);
  throwIfError(gamesQ.error, "Failed to load games");
  throwIfError(movesQ.error, "Failed to load strategic moves");
  throwIfError(portfolioQ.error, "Failed to load portfolio items");
  throwIfError(decisionsQ.error, "Failed to load decision log");

  const [space] = composeSpaces(
    ctx,
    [spaceQ.data as SpaceRow],
    (gamesQ.data ?? []) as GameRow[],
    (movesQ.data ?? []) as MoveRow[],
    (portfolioQ.data ?? []) as PortfolioRow[],
    (decisionsQ.data ?? []) as DecisionRow[]
  );
  return space ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createSpace(input: {
  name: string;
  timeHorizon: string;
  description: string;
}): Promise<SpaceWithData> {
  const ctx = await getCtx();
  const { supabase, orgId, userId } = ctx;
  const allowedHorizons = ["1yr", "3yr", "5yr", "10yr"];
  const { data, error } = await supabase
    .from("strategy_spaces")
    .insert({
      org_id: orgId,
      name: input.name,
      time_horizon: allowedHorizons.includes(input.timeHorizon) ? input.timeHorizon : "3yr",
      status: "active",
      owner_id: userId,
      thesis: input.description || null,
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to create strategy space");
  return mapSpace(data as SpaceRow, ctx);
}

export async function createGame(
  spaceId: string,
  input: {
    name: string;
    description: string;
    type: GameType;
    stakes: StakesLevel;
    scores?: Partial<GameScores>;
  }
): Promise<Game> {
  const { supabase } = await getCtx();
  const scores: GameScores = {
    asymmetry: clampScore(input.scores?.asymmetry ?? DEFAULT_SCORES.asymmetry),
    competitiveAdvantage: clampScore(input.scores?.competitiveAdvantage ?? DEFAULT_SCORES.competitiveAdvantage),
    timeHorizon: clampScore(input.scores?.timeHorizon ?? DEFAULT_SCORES.timeHorizon),
    reversibility: clampScore(input.scores?.reversibility ?? DEFAULT_SCORES.reversibility),
  };
  const { data, error } = await supabase
    .from("games")
    .insert({
      strategy_space_id: spaceId,
      name: input.name,
      game_type: input.type,
      stakes: input.stakes,
      status: "active",
      rationale: input.description || null,
      market: encodeScores(scores),
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to add game");
  return mapGame(data as GameRow);
}

export async function createMove(
  spaceId: string,
  input: { title: string; moveType: string; status: MoveStatus; deadline: string | null; gameId?: string | null }
): Promise<StrategicMove> {
  const { supabase, userId } = await getCtx();
  const { data, error } = await supabase
    .from("strategic_moves")
    .insert({
      strategy_space_id: spaceId,
      game_id: input.gameId ?? null,
      title: input.title,
      move_type: input.moveType || "move",
      status: input.status,
      deadline: input.deadline,
      owner_id: userId,
      outcome: null,
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to add move");
  return mapMove(data as MoveRow, new Map());
}

export async function updateMove(
  id: string,
  input: { status?: MoveStatus; outcome?: string | null }
): Promise<void> {
  const { supabase } = await getCtx();
  const patch: Record<string, unknown> = {};
  if (input.status !== undefined) patch.status = input.status;
  if (input.outcome !== undefined) patch.outcome = input.outcome;
  const { error } = await supabase.from("strategic_moves").update(patch).eq("id", id);
  throwIfError(error, "Failed to update move");
}

export async function updatePortfolioItemCategory(id: string, category: PortfolioCategory): Promise<void> {
  const { supabase } = await getCtx();
  const { error } = await supabase.from("portfolio_items").update({ category }).eq("id", id);
  throwIfError(error, "Failed to update portfolio item");
}

export async function createPortfolioItem(
  spaceId: string,
  input: { name: string; category: PortfolioCategory; allocation: number; confidence: number }
): Promise<PortfolioItem> {
  const { supabase } = await getCtx();
  const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(Number.isFinite(n) ? n : 0)));
  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      strategy_space_id: spaceId,
      name: input.name,
      category: input.category,
      allocation_pct: clampPct(input.allocation),
      confidence: clampPct(input.confidence),
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to add portfolio item");
  return mapPortfolioItem(data as PortfolioRow);
}

export async function createDecision(input: {
  spaceId: string;
  spaceName: string;
  title: string;
  rationale: string;
  alternatives: string[];
  outcomeNotes?: string;
}): Promise<Decision> {
  const { supabase, userId } = await getCtx();
  const { data, error } = await supabase
    .from("decision_log")
    .insert({
      strategy_space_id: input.spaceId,
      decision: input.title,
      context: input.outcomeNotes || null,
      alternatives_considered: input.alternatives,
      rationale: input.rationale || null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      review_date: inDays(30),
      outcome: "pending",
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to log decision");
  return mapDecision(data as DecisionRow, new Map([[input.spaceId, input.spaceName]]));
}

export async function updateDecisionOutcome(id: string, outcome: DecisionOutcome): Promise<void> {
  const { supabase } = await getCtx();
  const { error } = await supabase.from("decision_log").update({ outcome }).eq("id", id);
  throwIfError(error, "Failed to update decision outcome");
}

export async function deleteDecision(id: string): Promise<void> {
  const { supabase } = await getCtx();
  const { error } = await supabase.from("decision_log").delete().eq("id", id);
  throwIfError(error, "Failed to delete decision");
}

// ---------------------------------------------------------------------------
// Client-side aggregates (pure helpers shared by dashboard + diagnostics)
// ---------------------------------------------------------------------------

export interface StrategyHealth {
  totalSpaces: number;
  activeSpaces: number;
  totalGames: number;
  activeGames: number;
  totalMoves: number;
  movesInFlight: number;
  pendingDecisions: number;
  avgConfidence: number;
}

export function computeHealth(spaces: SpaceWithData[]): StrategyHealth {
  const allDecisions = spaces.flatMap((s) => s.decisions);
  const allPortfolio = spaces.flatMap((s) => s.portfolio);
  const allMoves = spaces.flatMap((s) => s.moves);
  return {
    totalSpaces: spaces.length,
    activeSpaces: spaces.filter((s) => s.status === "active").length,
    totalGames: spaces.reduce((acc, s) => acc + s.games.length, 0),
    activeGames: spaces.reduce((acc, s) => acc + s.games.filter((g) => g.status === "active").length, 0),
    totalMoves: allMoves.length,
    movesInFlight: allMoves.filter((m) => m.status === "in_progress").length,
    pendingDecisions: allDecisions.filter((d) => d.outcome === "pending").length,
    avgConfidence:
      allPortfolio.length > 0
        ? Math.round(allPortfolio.reduce((acc, p) => acc + p.confidence, 0) / allPortfolio.length)
        : 0,
  };
}

export function flattenDecisions(spaces: SpaceWithData[]): Decision[] {
  return spaces
    .flatMap((s) => s.decisions)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ---------------------------------------------------------------------------
// Demo seeding
// ---------------------------------------------------------------------------

function inDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

// Seed decision dates are static; shift them so the most recent lands one week ago
// and earlier ones keep their relative spacing.
const LATEST_SEED_DATE = Math.max(
  ...demoSpaces.flatMap((s) => s.decisions.map((d) => new Date(d.date).getTime()))
);

function relativeSeedDate(seedDate: string): string {
  const diffDays = Math.round((LATEST_SEED_DATE - new Date(seedDate).getTime()) / 86400000);
  return inDays(-(diffDays + 7));
}

export async function seedDemoData(): Promise<void> {
  const { supabase, orgId, userId } = await getCtx();

  for (const space of demoSpaces) {
    const { data: spaceRow, error: spaceError } = await supabase
      .from("strategy_spaces")
      .insert({
        org_id: orgId,
        name: space.name,
        time_horizon: space.timeHorizon,
        status: space.status,
        owner_id: userId,
        thesis: space.description,
      })
      .select("id")
      .single();
    throwIfError(spaceError, "Failed to seed strategy space");
    const spaceId = (spaceRow as { id: string }).id;

    // Games (capture ids so moves can reference them)
    const gameIdMap = new Map<string, string>();
    if (space.games.length > 0) {
      const { data: gameRows, error: gameError } = await supabase
        .from("games")
        .insert(
          space.games.map((g) => ({
            strategy_space_id: spaceId,
            name: g.name,
            game_type: g.type,
            stakes: g.stakes,
            status: g.status,
            rationale: g.description,
            market: encodeScores({
              asymmetry: g.asymmetry,
              competitiveAdvantage: g.competitiveAdvantage,
              timeHorizon: g.timeHorizon,
              reversibility: g.reversibility,
            }),
          }))
        )
        .select("id, name");
      throwIfError(gameError, "Failed to seed games");
      for (const g of space.games) {
        const match = ((gameRows ?? []) as { id: string; name: string }[]).find((r) => r.name === g.name);
        if (match) gameIdMap.set(g.id, match.id);
      }
    }

    // Portfolio items
    if (space.portfolio.length > 0) {
      const { error: portfolioError } = await supabase.from("portfolio_items").insert(
        space.portfolio.map((p) => ({
          strategy_space_id: spaceId,
          name: p.name,
          category: p.category,
          allocation_pct: p.allocation,
          confidence: p.confidence,
        }))
      );
      throwIfError(portfolioError, "Failed to seed portfolio items");
    }

    // Strategic moves
    const moves = demoMoves.filter((m) => m.spaceId === space.id);
    if (moves.length > 0) {
      const { error: moveError } = await supabase.from("strategic_moves").insert(
        moves.map((m) => ({
          strategy_space_id: spaceId,
          game_id: m.gameId ? gameIdMap.get(m.gameId) ?? null : null,
          title: m.title,
          move_type: m.moveType,
          status: m.status,
          deadline: inDays(m.deadlineInDays),
          owner_id: userId,
          outcome: m.outcome,
        }))
      );
      throwIfError(moveError, "Failed to seed strategic moves");
    }

    // Decision log
    if (space.decisions.length > 0) {
      const { error: decisionError } = await supabase.from("decision_log").insert(
        space.decisions.map((d) => ({
          strategy_space_id: spaceId,
          decision: d.title,
          context: d.outcomeNotes ?? null,
          alternatives_considered: d.alternativesConsidered,
          rationale: d.rationale,
          decided_by: userId,
          decided_at: relativeSeedDate(d.date),
          review_date: d.outcome === "pending" ? inDays(30) : null,
          outcome: d.outcome,
        }))
      );
      throwIfError(decisionError, "Failed to seed decision log");
    }
  }
}
