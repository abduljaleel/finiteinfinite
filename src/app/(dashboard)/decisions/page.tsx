"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createDecision,
  deleteDecision,
  fetchStrategyData,
  flattenDecisions,
  updateDecisionOutcome,
  type SpaceWithData,
} from "@/lib/data/api";
import type { Decision, DecisionOutcome } from "@/lib/data/strategy";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Ellipsis, Plus, Search } from "lucide-react";

function OutcomeBadge({ outcome }: { outcome: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    positive: "default",
    negative: "destructive",
    neutral: "secondary",
    pending: "outline",
  };
  return <Badge variant={variants[outcome] || "outline"} className="text-[10px]">{outcome}</Badge>;
}

export default function DecisionsPage() {
  const [spaces, setSpaces] = useState<SpaceWithData[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [spaceFilter, setSpaceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSpaceId, setNewSpaceId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newRationale, setNewRationale] = useState("");
  const [newAlternatives, setNewAlternatives] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStrategyData();
      setSpaces(data);
      setDecisions(flattenDecisions(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load decisions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      decisions.filter((d) => {
        if (spaceFilter !== "all" && d.spaceId !== spaceFilter) return false;
        if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.rationale.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [decisions, spaceFilter, search]
  );

  const handleCreate = async () => {
    const space = spaces.find((s) => s.id === (newSpaceId || spaces[0]?.id));
    if (!space) {
      setSaveError("Create a strategy space first, then log decisions against it.");
      return;
    }
    if (!newTitle.trim()) {
      setSaveError("Decision title is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const decision = await createDecision({
        spaceId: space.id,
        spaceName: space.name,
        title: newTitle.trim(),
        rationale: newRationale.trim(),
        alternatives: newAlternatives
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      setDecisions((prev) => [decision, ...prev]);
      setNewTitle("");
      setNewRationale("");
      setNewAlternatives("");
      setDialogOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to log decision");
    } finally {
      setSaving(false);
    }
  };

  const handleOutcomeChange = (id: string, outcome: DecisionOutcome) => {
    const previous = decisions;
    setError(null);
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, outcome } : d)));
    void updateDecisionOutcome(id, outcome).catch((e) => {
      setDecisions(previous);
      setError(e instanceof Error ? e.message : "Failed to update decision");
    });
  };

  const handleDelete = (id: string) => {
    const previous = decisions;
    setError(null);
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    void deleteDecision(id).catch((e) => {
      setDecisions(previous);
      setError(e instanceof Error ? e.message : "Failed to delete decision");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Decision Log</h1>
          <p className="text-muted-foreground">
            Cross-space chronological record of strategic decisions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Log Decision
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Decision</DialogTitle>
              <DialogDescription>
                Record a strategic decision, its rationale, and the alternatives you considered.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Strategy space</Label>
                <div className="flex flex-wrap gap-2">
                  {spaces.length === 0 && (
                    <p className="text-xs text-muted-foreground">No spaces yet — create one on the Spaces page first.</p>
                  )}
                  {spaces.map((space) => (
                    <Button
                      key={space.id}
                      type="button"
                      variant={(newSpaceId || spaces[0]?.id) === space.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewSpaceId(space.id)}
                    >
                      {space.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-title">Decision</Label>
                <Input id="decision-title" placeholder="e.g., Hire VP of Enterprise Sales" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-rationale">Rationale</Label>
                <Input id="decision-rationale" placeholder="Why this decision, why now" value={newRationale} onChange={(e) => setNewRationale(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-alternatives">Alternatives considered (comma-separated)</Label>
                <Input id="decision-alternatives" placeholder="e.g., Promote internally, Delay 6 months" value={newAlternatives} onChange={(e) => setNewAlternatives(e.target.value)} />
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => void handleCreate()} disabled={saving}>
                {saving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                {saving ? "Logging..." : "Log decision"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search decisions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={spaceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSpaceFilter("all")}
              >
                All spaces
              </Button>
              {spaces.map((space) => (
                <Button
                  key={space.id}
                  variant={spaceFilter === space.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSpaceFilter(space.id)}
                >
                  {space.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total" count={filtered.length} />
            <SummaryCard label="Pending" count={filtered.filter((d) => d.outcome === "pending").length} />
            <SummaryCard label="Positive" count={filtered.filter((d) => d.outcome === "positive").length} />
            <SummaryCard label="Neutral / Negative" count={filtered.filter((d) => d.outcome === "neutral" || d.outcome === "negative").length} />
          </div>

          {/* Decision List */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {decisions.length === 0
                  ? "No decisions logged yet. Use Log Decision to record your first one."
                  : "No decisions match your filters."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onOutcomeChange={handleOutcomeChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, count }: { label: string; count: number }) {
  return (
    <Card>
      <CardContent className="py-3 text-center">
        <p className="text-2xl font-bold tabular-nums">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

const OUTCOMES: DecisionOutcome[] = ["pending", "positive", "neutral", "negative"];

function DecisionCard({
  decision,
  onOutcomeChange,
  onDelete,
}: {
  decision: Decision;
  onOutcomeChange: (id: string, outcome: DecisionOutcome) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{decision.title}</p>
              <OutcomeBadge outcome={decision.outcome} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Link href={`/spaces/${decision.spaceId}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                {decision.spaceName}
              </Link>
              <span className="text-xs text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground">
                {new Date(decision.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                <Ellipsis className="h-4 w-4" />
                <span className="sr-only">Decision actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Set outcome</DropdownMenuLabel>
                {OUTCOMES.map((outcome) => (
                  <DropdownMenuItem
                    key={outcome}
                    disabled={decision.outcome === outcome}
                    onClick={() => onOutcomeChange(decision.id, outcome)}
                  >
                    {outcome}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(decision.id)}>
                  Delete decision
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={`/spaces/${decision.spaceId}`} className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{decision.rationale}</p>

        {decision.alternativesConsidered.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Alternatives considered:</p>
            <div className="flex flex-wrap gap-1">
              {decision.alternativesConsidered.map((alt, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal">{alt}</Badge>
              ))}
            </div>
          </div>
        )}

        {decision.outcomeNotes && (
          <div className="rounded-md bg-muted p-2">
            <p className="text-xs text-muted-foreground">{decision.outcomeNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
