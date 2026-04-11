"use client";

import { use, useState } from "react";
import { getSpaceById } from "@/lib/data/strategy";
import type { Game, PortfolioItem, PortfolioCategory, Decision } from "@/lib/data/strategy";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, ArrowRight, ArrowLeftRight, Infinity, Square } from "lucide-react";
import Link from "next/link";

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-foreground/70 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
    </div>
  );
}

function StakesBadge({ stakes }: { stakes: string }) {
  const colors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${colors[stakes] || ""}`}>
      {stakes}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    positive: "default",
    negative: "destructive",
    neutral: "secondary",
    pending: "outline",
  };
  return <Badge variant={variants[outcome] || "outline"} className="text-[10px]">{outcome}</Badge>;
}

// --- Games Tab ---
function GamesTab({ games }: { games: Game[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Game Selection Matrix</h3>
          <p className="text-sm text-muted-foreground">Evaluate which games to play based on strategic criteria</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-3 w-3 mr-1" />
            Add Game
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Game</DialogTitle>
              <DialogDescription>Define a new strategic game to track and evaluate.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="game-name">Game name</Label>
                <Input id="game-name" placeholder="e.g., Market Entry - Europe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-desc">Description</Label>
                <Input id="game-desc" placeholder="Strategic context" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="game-type">Type</Label>
                  <Input id="game-type" placeholder="finite / infinite" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-stakes">Stakes</Label>
                  <Input id="game-stakes" placeholder="low / medium / high / critical" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button>Add game</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead className="w-20">Type</TableHead>
              <TableHead className="w-20">Stakes</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24">Asymmetry</TableHead>
              <TableHead className="w-24">Advantage</TableHead>
              <TableHead className="w-24">Horizon</TableHead>
              <TableHead className="w-24">Reversibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{game.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{game.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={game.type === "infinite" ? "default" : "outline"} className="text-[10px] gap-1">
                    {game.type === "infinite" ? <Infinity className="h-2.5 w-2.5" /> : <Square className="h-2.5 w-2.5" />}
                    {game.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StakesBadge stakes={game.stakes} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{game.status}</Badge>
                </TableCell>
                <TableCell><ScoreBar value={game.asymmetry} /></TableCell>
                <TableCell><ScoreBar value={game.competitiveAdvantage} /></TableCell>
                <TableCell><ScoreBar value={game.timeHorizon} /></TableCell>
                <TableCell><ScoreBar value={game.reversibility} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <strong>Reading the matrix:</strong> High asymmetry + high advantage = games worth playing aggressively.
          Low reversibility = commit carefully. Infinite games reward consistency over time; finite games reward decisive action.
        </p>
      </div>
    </div>
  );
}

// --- Portfolio Tab ---
function PortfolioTab({ portfolio: initialPortfolio }: { portfolio: PortfolioItem[] }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  const categories: { key: PortfolioCategory; label: string; color: string }[] = [
    { key: "invest", label: "Invest", color: "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20" },
    { key: "maintain", label: "Maintain", color: "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20" },
    { key: "harvest", label: "Harvest", color: "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" },
    { key: "divest", label: "Divest", color: "border-red-500/50 bg-red-50/50 dark:bg-red-950/20" },
  ];

  const moveItem = (itemId: string, direction: "left" | "right") => {
    setPortfolio((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const catOrder: PortfolioCategory[] = ["invest", "maintain", "harvest", "divest"];
        const currentIdx = catOrder.indexOf(item.category);
        const newIdx = direction === "right" ? Math.min(currentIdx + 1, 3) : Math.max(currentIdx - 1, 0);
        return { ...item, category: catOrder[newIdx] };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Portfolio Allocation</h3>
        <p className="text-sm text-muted-foreground">Categorize and allocate across strategic initiatives</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const items = portfolio.filter((p) => p.category === cat.key);
          const totalAllocation = items.reduce((a, i) => a + i.allocation, 0);

          return (
            <div key={cat.key} className={`rounded-lg border-2 p-3 ${cat.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{cat.label}</h4>
                <span className="text-xs text-muted-foreground">{totalAllocation}%</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No items</p>
                )}
                {items.map((item) => (
                  <div key={item.id} className="rounded-md border bg-background p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.allocation}% allocation</span>
                      <span>{item.confidence}% confidence</span>
                    </div>
                    <Progress value={item.confidence} />
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(item.id, "left")}
                        disabled={cat.key === "invest"}
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(item.id, "right")}
                        disabled={cat.key === "divest"}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Scenarios Tab ---
function ScenariosTab({ scenarios }: { scenarios: { id: string; name: string; assumptions: string[]; projectedOutcomes: string[]; probability: number }[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Scenario Planning</h3>
        <p className="text-sm text-muted-foreground">Compare possible futures and their strategic implications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{scenario.name}</CardTitle>
                <span className="text-sm font-semibold tabular-nums">{scenario.probability}%</span>
              </div>
              <Progress value={scenario.probability} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Key Assumptions</p>
                <ul className="space-y-1">
                  {scenario.assumptions.map((a, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-muted-foreground shrink-0">&bull;</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Projected Outcomes</p>
                <ul className="space-y-1">
                  {scenario.projectedOutcomes.map((o, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-muted-foreground shrink-0">&rarr;</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Log Tab ---
function LogTab({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Decision Log</h3>
        <p className="text-sm text-muted-foreground">Track decisions, rationale, and outcomes for this space</p>
      </div>

      {decisions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No decisions logged for this space yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card key={decision.id}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{decision.title}</p>
                      <OutcomeBadge outcome={decision.outcome} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(decision.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{decision.rationale}</p>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Alternatives considered:</p>
                  <div className="flex flex-wrap gap-1">
                    {decision.alternativesConsidered.map((alt, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-normal">{alt}</Badge>
                    ))}
                  </div>
                </div>
                {decision.outcomeNotes && (
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-xs text-muted-foreground">{decision.outcomeNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Page ---
export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const space = getSpaceById(id);

  if (!space) {
    return (
      <div className="space-y-4">
        <Link href="/spaces" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to spaces
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Strategy space not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/spaces" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> Back to spaces
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{space.name}</h1>
              <Badge variant={space.status === "active" ? "default" : "secondary"}>{space.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {space.timeHorizon} horizon &middot; {space.owner}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{space.description}</p>
      </div>

      <Tabs defaultValue="games">
        <TabsList variant="line">
          <TabsTrigger value="games">Games ({space.games.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({space.portfolio.length})</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios ({space.scenarios.length})</TabsTrigger>
          <TabsTrigger value="log">Log ({space.decisions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="games" className="mt-4">
          <GamesTab games={space.games} />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTab portfolio={space.portfolio} />
        </TabsContent>
        <TabsContent value="scenarios" className="mt-4">
          <ScenariosTab scenarios={space.scenarios} />
        </TabsContent>
        <TabsContent value="log" className="mt-4">
          <LogTab decisions={space.decisions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
