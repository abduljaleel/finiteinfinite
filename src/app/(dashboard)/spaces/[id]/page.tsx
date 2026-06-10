"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  createGame,
  createMove,
  createPortfolioItem,
  fetchSpace,
  updateMove,
  updatePortfolioItemCategory,
  type SpaceWithData,
} from "@/lib/data/api";
import type { Game, GameType, StakesLevel, PortfolioItem, PortfolioCategory, Decision, StrategicMove, MoveStatus } from "@/lib/data/strategy";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, ArrowRight, Infinity, Square, LoaderCircle, CalendarClock, Ellipsis } from "lucide-react";
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
const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "finite", label: "finite" },
  { value: "infinite", label: "infinite" },
];
const STAKES_OPTIONS: { value: StakesLevel; label: string }[] = [
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
  { value: "critical", label: "critical" },
];
const SCORE_FIELDS: { key: "asymmetry" | "competitiveAdvantage" | "timeHorizon" | "reversibility"; label: string }[] = [
  { key: "asymmetry", label: "Asymmetry" },
  { key: "competitiveAdvantage", label: "Advantage" },
  { key: "timeHorizon", label: "Horizon" },
  { key: "reversibility", label: "Reversibility" },
];
const DEFAULT_SCORE_INPUTS = { asymmetry: "5", competitiveAdvantage: "5", timeHorizon: "5", reversibility: "5" };

function GamesTab({ spaceId, games, onCreated }: { spaceId: string; games: Game[]; onCreated: (game: Game) => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GameType>("finite");
  const [stakes, setStakes] = useState<StakesLevel>("medium");
  const [scoreInputs, setScoreInputs] = useState({ ...DEFAULT_SCORE_INPUTS });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) {
      setSaveError("Game name is required.");
      return;
    }
    const parsedScores: Record<string, number> = {};
    for (const field of SCORE_FIELDS) {
      const n = Number(scoreInputs[field.key]);
      if (!Number.isFinite(n) || n < 1 || n > 10) {
        setSaveError(`${field.label} must be a number between 1 and 10.`);
        return;
      }
      parsedScores[field.key] = Math.round(n);
    }
    setSaving(true);
    setSaveError(null);
    try {
      const game = await createGame(spaceId, {
        name: name.trim(),
        description: description.trim(),
        type,
        stakes,
        scores: parsedScores,
      });
      onCreated(game);
      setName("");
      setDescription("");
      setType("finite");
      setStakes("medium");
      setScoreInputs({ ...DEFAULT_SCORE_INPUTS });
      setDialogOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to add game");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Game Selection Matrix</h3>
          <p className="text-sm text-muted-foreground">Evaluate which games to play based on strategic criteria</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <Input id="game-name" placeholder="e.g., Market Entry - Europe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-desc">Description</Label>
                <Input id="game-desc" placeholder="Strategic context" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="game-type">Type</Label>
                  <Select
                    items={GAME_TYPE_OPTIONS}
                    value={type}
                    onValueChange={(value) => setType((value ?? "finite") as GameType)}
                  >
                    <SelectTrigger id="game-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GAME_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-stakes">Stakes</Label>
                  <Select
                    items={STAKES_OPTIONS}
                    value={stakes}
                    onValueChange={(value) => setStakes((value ?? "medium") as StakesLevel)}
                  >
                    <SelectTrigger id="game-stakes" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAKES_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Evaluation scores (1-10)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SCORE_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={`game-score-${field.key}`} className="text-xs font-normal text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        id={`game-score-${field.key}`}
                        type="number"
                        min={1}
                        max={10}
                        step={1}
                        value={scoreInputs[field.key]}
                        onChange={(e) =>
                          setScoreInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => void handleAdd()} disabled={saving}>
                {saving && <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />}
                {saving ? "Adding..." : "Add game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No games tracked in this space yet. Add the first game to start the matrix.
          </CardContent>
        </Card>
      ) : (
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
      )}

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
const PORTFOLIO_CATEGORY_OPTIONS: { value: PortfolioCategory; label: string }[] = [
  { value: "invest", label: "Invest" },
  { value: "maintain", label: "Maintain" },
  { value: "harvest", label: "Harvest" },
  { value: "divest", label: "Divest" },
];

function PortfolioTab({
  spaceId,
  portfolio,
  onCategoryChanged,
  onCreated,
}: {
  spaceId: string;
  portfolio: PortfolioItem[];
  onCategoryChanged: (itemId: string, category: PortfolioCategory) => void;
  onCreated: (item: PortfolioItem) => void;
}) {
  const [moveError, setMoveError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PortfolioCategory>("invest");
  const [allocation, setAllocation] = useState("10");
  const [confidence, setConfidence] = useState("50");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories: { key: PortfolioCategory; label: string; color: string }[] = [
    { key: "invest", label: "Invest", color: "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20" },
    { key: "maintain", label: "Maintain", color: "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20" },
    { key: "harvest", label: "Harvest", color: "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" },
    { key: "divest", label: "Divest", color: "border-red-500/50 bg-red-50/50 dark:bg-red-950/20" },
  ];

  const moveItem = (itemId: string, direction: "left" | "right") => {
    const item = portfolio.find((p) => p.id === itemId);
    if (!item) return;
    const catOrder: PortfolioCategory[] = ["invest", "maintain", "harvest", "divest"];
    const currentIdx = catOrder.indexOf(item.category);
    const newIdx = direction === "right" ? Math.min(currentIdx + 1, 3) : Math.max(currentIdx - 1, 0);
    const newCategory = catOrder[newIdx];
    if (newCategory === item.category) return;

    const previousCategory = item.category;
    setMoveError(null);
    onCategoryChanged(itemId, newCategory);
    void updatePortfolioItemCategory(itemId, newCategory).catch((e) => {
      onCategoryChanged(itemId, previousCategory);
      setMoveError(e instanceof Error ? e.message : "Failed to update portfolio item");
    });
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setSaveError("Item name is required.");
      return;
    }
    const allocationNum = Number(allocation);
    const confidenceNum = Number(confidence);
    if (!Number.isFinite(allocationNum) || allocationNum < 0 || allocationNum > 100) {
      setSaveError("Allocation must be a number between 0 and 100.");
      return;
    }
    if (!Number.isFinite(confidenceNum) || confidenceNum < 0 || confidenceNum > 100) {
      setSaveError("Confidence must be a number between 0 and 100.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const item = await createPortfolioItem(spaceId, {
        name: name.trim(),
        category,
        allocation: allocationNum,
        confidence: confidenceNum,
      });
      onCreated(item);
      setName("");
      setCategory("invest");
      setAllocation("10");
      setConfidence("50");
      setDialogOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to add portfolio item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Portfolio Allocation</h3>
          <p className="text-sm text-muted-foreground">Categorize and allocate across strategic initiatives</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
              <DialogDescription>Add a strategic initiative to allocate and track confidence against.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="portfolio-name">Item name</Label>
                <Input id="portfolio-name" placeholder="e.g., Enterprise tier" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio-category">Category</Label>
                <Select
                  items={PORTFOLIO_CATEGORY_OPTIONS}
                  value={category}
                  onValueChange={(value) => setCategory((value ?? "invest") as PortfolioCategory)}
                >
                  <SelectTrigger id="portfolio-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTFOLIO_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-allocation">Allocation %</Label>
                  <Input
                    id="portfolio-allocation"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={allocation}
                    onChange={(e) => setAllocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-confidence">Confidence %</Label>
                  <Input
                    id="portfolio-confidence"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                  />
                </div>
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => void handleAdd()} disabled={saving}>
                {saving && <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />}
                {saving ? "Adding..." : "Add item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {moveError && <p className="text-sm text-destructive">{moveError}</p>}

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

// --- Moves Tab ---
const MOVE_STATUSES: MoveStatus[] = ["planned", "in_progress", "completed"];

function MovesTab({
  spaceId,
  moves,
  onCreated,
  onStatusChanged,
}: {
  spaceId: string;
  moves: StrategicMove[];
  onCreated: (move: StrategicMove) => void;
  onStatusChanged: (moveId: string, status: MoveStatus) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [moveType, setMoveType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    in_progress: "default",
    planned: "outline",
    completed: "secondary",
  };

  const handleStatusChange = (move: StrategicMove, status: MoveStatus) => {
    if (move.status === status) return;
    const previousStatus = move.status;
    setStatusError(null);
    onStatusChanged(move.id, status);
    void updateMove(move.id, { status }).catch((e) => {
      onStatusChanged(move.id, previousStatus);
      setStatusError(e instanceof Error ? e.message : "Failed to update move status");
    });
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      setSaveError("Move title is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const move = await createMove(spaceId, {
        title: title.trim(),
        moveType: moveType.trim().toLowerCase() || "move",
        status: "planned" as MoveStatus,
        deadline: deadline ? new Date(`${deadline}T12:00:00`).toISOString() : null,
      });
      onCreated(move);
      setTitle("");
      setMoveType("");
      setDeadline("");
      setDialogOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to add move");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Strategic Moves</h3>
          <p className="text-sm text-muted-foreground">Concrete moves that advance the games in this space</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-3 w-3 mr-1" />
            Add Move
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Strategic Move</DialogTitle>
              <DialogDescription>Capture a concrete move to execute within this space.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="move-title">Move title</Label>
                <Input id="move-title" placeholder="e.g., Hire enterprise AE pod" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="move-type">Move type</Label>
                  <Input id="move-type" placeholder="build / launch / partner / research" value={moveType} onChange={(e) => setMoveType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="move-deadline">Deadline</Label>
                  <Input id="move-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => void handleAdd()} disabled={saving}>
                {saving && <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />}
                {saving ? "Adding..." : "Add move"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {statusError && <p className="text-sm text-destructive">{statusError}</p>}

      {moves.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No strategic moves yet. Add the first move to start executing this space.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moves.map((move) => (
            <Card key={move.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{move.title}</CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={statusVariant[move.status] || "outline"} className="text-[10px]">
                      {move.status.replace("_", " ")}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <Ellipsis className="h-4 w-4" />
                        <span className="sr-only">Move actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Set status</DropdownMenuLabel>
                        {MOVE_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={move.status === status}
                            onClick={() => handleStatusChange(move, status)}
                          >
                            {status.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {move.moveType}
                  {move.gameName ? <> &middot; {move.gameName}</> : null}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {move.deadline && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    Due {new Date(move.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {move.outcome && (
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-xs text-muted-foreground">{move.outcome}</p>
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
  const [space, setSpace] = useState<SpaceWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSpace(await fetchSpace(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load strategy space");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGameCreated = (game: Game) => {
    setSpace((prev) => (prev ? { ...prev, games: [...prev.games, game] } : prev));
  };

  const handleMoveCreated = (move: StrategicMove) => {
    setSpace((prev) => (prev ? { ...prev, moves: [...prev.moves, move] } : prev));
  };

  const handleMoveStatusChanged = (moveId: string, status: MoveStatus) => {
    setSpace((prev) =>
      prev
        ? { ...prev, moves: prev.moves.map((m) => (m.id === moveId ? { ...m, status } : m)) }
        : prev
    );
  };

  const handlePortfolioItemCreated = (item: PortfolioItem) => {
    setSpace((prev) => (prev ? { ...prev, portfolio: [...prev.portfolio, item] } : prev));
  };

  const handlePortfolioCategoryChanged = (itemId: string, category: PortfolioCategory) => {
    setSpace((prev) =>
      prev
        ? { ...prev, portfolio: prev.portfolio.map((p) => (p.id === itemId ? { ...p, category } : p)) }
        : prev
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/spaces" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to spaces
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <TabsTrigger value="moves">Moves ({space.moves.length})</TabsTrigger>
          <TabsTrigger value="log">Log ({space.decisions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="games" className="mt-4">
          <GamesTab spaceId={space.id} games={space.games} onCreated={handleGameCreated} />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTab
            spaceId={space.id}
            portfolio={space.portfolio}
            onCategoryChanged={handlePortfolioCategoryChanged}
            onCreated={handlePortfolioItemCreated}
          />
        </TabsContent>
        <TabsContent value="moves" className="mt-4">
          <MovesTab
            spaceId={space.id}
            moves={space.moves}
            onCreated={handleMoveCreated}
            onStatusChanged={handleMoveStatusChanged}
          />
        </TabsContent>
        <TabsContent value="log" className="mt-4">
          <LogTab decisions={space.decisions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
