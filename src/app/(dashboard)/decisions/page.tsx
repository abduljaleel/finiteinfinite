"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllDecisions, strategySpaces } from "@/lib/data/strategy";
import type { Decision } from "@/lib/data/strategy";
import Link from "next/link";
import { ArrowRight, Filter, Search } from "lucide-react";

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
  const allDecisions = getAllDecisions();
  const [spaceFilter, setSpaceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = allDecisions.filter((d) => {
    if (spaceFilter !== "all" && d.spaceId !== spaceFilter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.rationale.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decision Log</h1>
        <p className="text-muted-foreground">
          Cross-space chronological record of strategic decisions
        </p>
      </div>

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
        <div className="flex gap-2">
          <Button
            variant={spaceFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSpaceFilter("all")}
          >
            All spaces
          </Button>
          {strategySpaces.map((space) => (
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
            No decisions match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
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

function DecisionCard({ decision }: { decision: Decision }) {
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
          <Link href={`/spaces/${decision.spaceId}`} className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Link>
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
  );
}
