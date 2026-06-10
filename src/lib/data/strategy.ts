export type GameType = "finite" | "infinite";
export type StakesLevel = "low" | "medium" | "high" | "critical";
export type GameStatus = "active" | "watching" | "paused" | "completed";
export type PortfolioCategory = "invest" | "maintain" | "harvest" | "divest";
export type SpaceStatus = "active" | "planning" | "archived";
export type TimeHorizon = "1yr" | "3yr" | "5yr" | "10yr";
export type DecisionOutcome = "pending" | "positive" | "negative" | "neutral";

export interface Game {
  id: string;
  name: string;
  type: GameType;
  stakes: StakesLevel;
  status: GameStatus;
  asymmetry: number; // 1-10
  competitiveAdvantage: number; // 1-10
  timeHorizon: number; // 1-10
  reversibility: number; // 1-10
  description: string;
}

export interface PortfolioItem {
  id: string;
  name: string;
  category: PortfolioCategory;
  allocation: number; // percentage
  confidence: number; // 1-100
}

export interface Scenario {
  id: string;
  name: string;
  assumptions: string[];
  projectedOutcomes: string[];
  probability: number; // 0-100
}

export interface Decision {
  id: string;
  spaceId: string;
  spaceName: string;
  title: string;
  date: string;
  rationale: string;
  alternativesConsidered: string[];
  outcome: DecisionOutcome;
  outcomeNotes?: string;
}

export interface StrategySpace {
  id: string;
  name: string;
  timeHorizon: TimeHorizon;
  status: SpaceStatus;
  owner: string;
  description: string;
  games: Game[];
  portfolio: PortfolioItem[];
  scenarios: Scenario[];
  decisions: Decision[];
}

export type MoveStatus = "planned" | "in_progress" | "completed";

export interface StrategicMove {
  id: string;
  spaceId: string;
  gameId: string | null;
  gameName: string | null;
  title: string;
  moveType: string;
  status: MoveStatus;
  deadline: string | null; // ISO date
  outcome: string | null;
}

export const strategySpaces: StrategySpace[] = [
  {
    id: "sp-1",
    name: "Core Product Expansion",
    timeHorizon: "3yr",
    status: "active",
    owner: "Alex Chen",
    description: "Strategic decisions around expanding the core product line into adjacent markets and new customer segments.",
    games: [
      {
        id: "g-1",
        name: "Enterprise Upmarket Move",
        type: "infinite",
        stakes: "high",
        status: "active",
        asymmetry: 8,
        competitiveAdvantage: 7,
        timeHorizon: 8,
        reversibility: 4,
        description: "Shift positioning and product to serve enterprise buyers with higher ACV.",
      },
      {
        id: "g-2",
        name: "API Platform Launch",
        type: "finite",
        stakes: "medium",
        status: "active",
        asymmetry: 7,
        competitiveAdvantage: 6,
        timeHorizon: 5,
        reversibility: 7,
        description: "Ship a public API layer to enable third-party integrations and a developer ecosystem.",
      },
      {
        id: "g-3",
        name: "Competitor Price War",
        type: "finite",
        stakes: "high",
        status: "watching",
        asymmetry: 3,
        competitiveAdvantage: 4,
        timeHorizon: 2,
        reversibility: 6,
        description: "Respond to aggressive pricing from new entrant targeting SMB segment.",
      },
      {
        id: "g-4",
        name: "Brand Authority Building",
        type: "infinite",
        stakes: "medium",
        status: "active",
        asymmetry: 6,
        competitiveAdvantage: 8,
        timeHorizon: 9,
        reversibility: 8,
        description: "Invest in thought leadership, content, and community to build lasting brand moat.",
      },
    ],
    portfolio: [
      { id: "p-1", name: "Enterprise Sales Team", category: "invest", allocation: 35, confidence: 78 },
      { id: "p-2", name: "API Platform", category: "invest", allocation: 25, confidence: 65 },
      { id: "p-3", name: "SMB Self-Serve", category: "maintain", allocation: 20, confidence: 85 },
      { id: "p-4", name: "Legacy Integrations", category: "harvest", allocation: 12, confidence: 90 },
      { id: "p-5", name: "On-Premise Offering", category: "divest", allocation: 8, confidence: 72 },
    ],
    scenarios: [
      {
        id: "sc-1",
        name: "Enterprise Breakout",
        assumptions: ["Enterprise pipeline converts at 25%+", "Product-market fit confirmed by Q3", "Hiring plan executes on time"],
        projectedOutcomes: ["3x ARR growth in 18 months", "Series B at $100M+ valuation", "Market leader position in vertical"],
        probability: 35,
      },
      {
        id: "sc-2",
        name: "Steady Growth",
        assumptions: ["Enterprise traction is moderate", "SMB remains strong base", "API adoption grows organically"],
        projectedOutcomes: ["1.5x ARR growth annually", "Profitable by end of year 2", "Strong mid-market position"],
        probability: 45,
      },
      {
        id: "sc-3",
        name: "Competitive Squeeze",
        assumptions: ["New entrant gains significant share", "Enterprise deals take longer than expected", "Pricing pressure intensifies"],
        projectedOutcomes: ["Flat ARR for 6-12 months", "Need to cut burn rate", "Pivot toward differentiated niche"],
        probability: 20,
      },
    ],
    decisions: [
      {
        id: "d-1",
        spaceId: "sp-1",
        spaceName: "Core Product Expansion",
        title: "Hire VP of Enterprise Sales",
        date: "2026-03-15",
        rationale: "Enterprise pipeline is strong but conversion needs dedicated leadership. Current team lacks enterprise sales motion experience.",
        alternativesConsidered: ["Promote internal candidate", "Use sales consultancy", "Delay enterprise push 6 months"],
        outcome: "positive",
        outcomeNotes: "Pipeline velocity increased 40% within first quarter.",
      },
      {
        id: "d-2",
        spaceId: "sp-1",
        spaceName: "Core Product Expansion",
        title: "Do not match competitor pricing",
        date: "2026-02-28",
        rationale: "Price war is a finite game with negative-sum outcome. Our differentiation is in product quality and support, not price.",
        alternativesConsidered: ["Match pricing for SMB tier only", "Introduce a free tier", "Offer annual discount matching competitor"],
        outcome: "pending",
      },
    ],
  },
  {
    id: "sp-2",
    name: "AI Infrastructure Bet",
    timeHorizon: "5yr",
    status: "active",
    owner: "Sam Patel",
    description: "Long-horizon positioning around AI capabilities, tooling, and infrastructure as a competitive moat.",
    games: [
      {
        id: "g-5",
        name: "Proprietary Model Training",
        type: "infinite",
        stakes: "critical",
        status: "active",
        asymmetry: 9,
        competitiveAdvantage: 8,
        timeHorizon: 9,
        reversibility: 3,
        description: "Build proprietary models on domain-specific data to create defensible AI capability.",
      },
      {
        id: "g-6",
        name: "AI Feature Parity Race",
        type: "finite",
        stakes: "medium",
        status: "active",
        asymmetry: 4,
        competitiveAdvantage: 5,
        timeHorizon: 3,
        reversibility: 8,
        description: "Ship AI features matching competitor announcements to prevent churn narrative.",
      },
      {
        id: "g-7",
        name: "Research Partnerships",
        type: "infinite",
        stakes: "medium",
        status: "watching",
        asymmetry: 7,
        competitiveAdvantage: 6,
        timeHorizon: 8,
        reversibility: 7,
        description: "Establish partnerships with universities and research labs for long-term capability building.",
      },
    ],
    portfolio: [
      { id: "p-6", name: "Model Training Infra", category: "invest", allocation: 40, confidence: 60 },
      { id: "p-7", name: "AI Feature Development", category: "maintain", allocation: 30, confidence: 75 },
      { id: "p-8", name: "Data Pipeline", category: "invest", allocation: 20, confidence: 70 },
      { id: "p-9", name: "Legacy ML Models", category: "harvest", allocation: 10, confidence: 88 },
    ],
    scenarios: [
      {
        id: "sc-4",
        name: "AI Moat Established",
        assumptions: ["Proprietary models outperform general-purpose alternatives", "Data flywheel kicks in", "Talent retention holds"],
        projectedOutcomes: ["Defensible 18-month lead", "Premium pricing power", "Acquisition interest from majors"],
        probability: 30,
      },
      {
        id: "sc-5",
        name: "Commoditization Wave",
        assumptions: ["Open-source models close the gap", "AI becomes table stakes", "Differentiation shifts to UX and workflow"],
        projectedOutcomes: ["AI capability is necessary but not sufficient", "Competition on integration quality", "Moderate growth trajectory"],
        probability: 50,
      },
      {
        id: "sc-6",
        name: "Regulatory Disruption",
        assumptions: ["Significant AI regulation passes", "Compliance costs increase 3-5x", "Smaller players exit market"],
        projectedOutcomes: ["Early compliance becomes advantage", "Market consolidation benefits incumbents", "Slower overall growth"],
        probability: 20,
      },
    ],
    decisions: [
      {
        id: "d-3",
        spaceId: "sp-2",
        spaceName: "AI Infrastructure Bet",
        title: "Allocate 40% of engineering to AI infrastructure",
        date: "2026-01-10",
        rationale: "The window for building defensible AI capability is closing. Underinvestment now means permanent disadvantage in 24 months.",
        alternativesConsidered: ["25% allocation with external contractors", "Partner with AI vendor instead of building", "Wait 6 months for technology to mature"],
        outcome: "pending",
      },
      {
        id: "d-4",
        spaceId: "sp-2",
        spaceName: "AI Infrastructure Bet",
        title: "Skip the AI feature parity race for Q1",
        date: "2026-03-01",
        rationale: "Feature parity is a finite game. Investing in infrastructure will compound. Cosmetic AI features can wait.",
        alternativesConsidered: ["Ship minimal AI features for marketing", "Hire contractor team for feature parity", "License third-party AI features"],
        outcome: "neutral",
        outcomeNotes: "Some churn from perception gap, but infrastructure investment is on track.",
      },
    ],
  },
  {
    id: "sp-3",
    name: "Market Entry: APAC",
    timeHorizon: "1yr",
    status: "planning",
    owner: "Alex Chen",
    description: "Evaluate and execute initial market entry into Asia-Pacific, starting with Singapore and Australia.",
    games: [
      {
        id: "g-8",
        name: "Singapore Launch",
        type: "finite",
        stakes: "medium",
        status: "active",
        asymmetry: 6,
        competitiveAdvantage: 5,
        timeHorizon: 3,
        reversibility: 7,
        description: "Launch in Singapore as beachhead for APAC expansion.",
      },
      {
        id: "g-9",
        name: "Local Partnership Network",
        type: "infinite",
        stakes: "low",
        status: "watching",
        asymmetry: 5,
        competitiveAdvantage: 4,
        timeHorizon: 6,
        reversibility: 8,
        description: "Build relationships with local system integrators and consulting firms.",
      },
    ],
    portfolio: [
      { id: "p-10", name: "Singapore Operations", category: "invest", allocation: 60, confidence: 55 },
      { id: "p-11", name: "Australia Research", category: "maintain", allocation: 25, confidence: 45 },
      { id: "p-12", name: "Japan Exploration", category: "divest", allocation: 15, confidence: 30 },
    ],
    scenarios: [
      {
        id: "sc-7",
        name: "Strong Regional Traction",
        assumptions: ["Singapore launch generates 10+ enterprise leads", "Local team hired within 3 months", "Regulatory requirements manageable"],
        projectedOutcomes: ["APAC contributes 15% of revenue by year end", "Australia expansion greenlit", "Regional brand established"],
        probability: 40,
      },
      {
        id: "sc-8",
        name: "Slow Burn Entry",
        assumptions: ["Lead generation slower than expected", "Product localization needed", "Longer sales cycles than NA"],
        projectedOutcomes: ["APAC at 5% of revenue", "Need additional 12 months to reach targets", "Valuable market learning acquired"],
        probability: 60,
      },
    ],
    decisions: [
      {
        id: "d-5",
        spaceId: "sp-3",
        spaceName: "Market Entry: APAC",
        title: "Start with Singapore, not Australia",
        date: "2026-04-01",
        rationale: "Singapore offers English-speaking market, tech-forward regulatory environment, and lower operational complexity as a beachhead.",
        alternativesConsidered: ["Start with Australia (larger market)", "Enter both simultaneously", "Start with Japan (largest APAC market)"],
        outcome: "pending",
      },
    ],
  },
];

// Demo content for strategic_moves (no scenarios table exists in the product schema).
// spaceId / gameId reference the seed ids above; deadlineInDays is relative to today.
export interface DemoMove {
  spaceId: string;
  gameId: string | null;
  title: string;
  moveType: string;
  status: MoveStatus;
  deadlineInDays: number;
  outcome: string | null;
}

export const demoMoves: DemoMove[] = [
  { spaceId: "sp-1", gameId: "g-1", title: "Hire enterprise AE pod", moveType: "build", status: "in_progress", deadlineInDays: 30, outcome: null },
  { spaceId: "sp-1", gameId: "g-2", title: "Publish public API beta docs", moveType: "launch", status: "planned", deadlineInDays: 45, outcome: null },
  { spaceId: "sp-1", gameId: "g-3", title: "Run value-based pricing study", moveType: "research", status: "completed", deadlineInDays: -10, outcome: "Confirmed that matching competitor pricing would erode margin ~18% with no measurable retention gain." },
  { spaceId: "sp-1", gameId: "g-4", title: "Launch executive content series", moveType: "launch", status: "in_progress", deadlineInDays: 21, outcome: null },
  { spaceId: "sp-2", gameId: "g-5", title: "Stand up dedicated training cluster", moveType: "build", status: "in_progress", deadlineInDays: 60, outcome: null },
  { spaceId: "sp-2", gameId: "g-5", title: "Define proprietary data flywheel metrics", moveType: "research", status: "planned", deadlineInDays: 35, outcome: null },
  { spaceId: "sp-2", gameId: "g-7", title: "Sign two university research MOUs", moveType: "partner", status: "planned", deadlineInDays: 90, outcome: null },
  { spaceId: "sp-3", gameId: "g-8", title: "Incorporate Singapore entity", moveType: "build", status: "in_progress", deadlineInDays: 21, outcome: null },
  { spaceId: "sp-3", gameId: "g-9", title: "Shortlist five SI partners", moveType: "partner", status: "planned", deadlineInDays: 40, outcome: null },
];

export function getAllDecisions(): Decision[] {
  return strategySpaces.flatMap((space) => space.decisions).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSpaceById(id: string): StrategySpace | undefined {
  return strategySpaces.find((space) => space.id === id);
}

export function getStrategyHealth(): {
  totalSpaces: number;
  activeSpaces: number;
  totalGames: number;
  activeGames: number;
  pendingDecisions: number;
  avgConfidence: number;
} {
  const totalSpaces = strategySpaces.length;
  const activeSpaces = strategySpaces.filter((s) => s.status === "active").length;
  const totalGames = strategySpaces.reduce((acc, s) => acc + s.games.length, 0);
  const activeGames = strategySpaces.reduce((acc, s) => acc + s.games.filter((g) => g.status === "active").length, 0);
  const allDecisions = getAllDecisions();
  const pendingDecisions = allDecisions.filter((d) => d.outcome === "pending").length;
  const allPortfolio = strategySpaces.flatMap((s) => s.portfolio);
  const avgConfidence = allPortfolio.length > 0
    ? Math.round(allPortfolio.reduce((acc, p) => acc + p.confidence, 0) / allPortfolio.length)
    : 0;
  return { totalSpaces, activeSpaces, totalGames, activeGames, pendingDecisions, avgConfidence };
}
