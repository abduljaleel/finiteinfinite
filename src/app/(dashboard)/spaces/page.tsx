"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { createSpace, fetchStrategyData, type SpaceWithData } from "@/lib/data/api";
import Link from "next/link";
import { Plus, ArrowRight, LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const horizonOptions = [
  { value: "1yr", label: "1 year" },
  { value: "3yr", label: "3 years" },
  { value: "5yr", label: "5 years" },
  { value: "10yr", label: "10 years" },
];

const horizonColors: Record<string, string> = {
  "1yr": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "3yr": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "5yr": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "10yr": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<SpaceWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [horizon, setHorizon] = useState("3yr");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSpaces(await fetchStrategyData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load strategy spaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setCreateError("Space name is required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const space = await createSpace({
        name: name.trim(),
        timeHorizon: horizon || "3yr",
        description: description.trim(),
      });
      setSpaces((prev) => [...prev, space]);
      setName("");
      setHorizon("3yr");
      setDescription("");
      setDialogOpen(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create space");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Spaces</h1>
          <p className="text-muted-foreground">
            Domains of strategic play. Each space contains the games you choose to play.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Create Space
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Strategy Space</DialogTitle>
              <DialogDescription>
                Define a new strategic domain to analyze and track decisions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="space-name">Space name</Label>
                <Input id="space-name" placeholder="e.g., Market Expansion" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-horizon">Time horizon</Label>
                <Select items={horizonOptions} value={horizon} onValueChange={(value) => setHorizon(value ?? "3yr")}>
                  <SelectTrigger id="space-horizon" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horizonOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-desc">Description</Label>
                <Input id="space-desc" placeholder="Strategic context for this space" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => void handleCreate()} disabled={creating}>
                {creating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                {creating ? "Creating..." : "Create space"}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : spaces.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <p className="font-medium">No strategy spaces yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first space to start mapping the games you choose to play.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => {
            const activeGames = space.games.filter((g) => g.status === "active").length;
            const totalGames = space.games.length;
            const avgConfidence = space.portfolio.length > 0
              ? Math.round(space.portfolio.reduce((a, p) => a + p.confidence, 0) / space.portfolio.length)
              : 0;

            return (
              <Link key={space.id} href={`/spaces/${space.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base truncate">{space.name}</CardTitle>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${horizonColors[space.timeHorizon] || ""}`}>
                          {space.timeHorizon}
                        </span>
                        <Badge variant={space.status === "active" ? "default" : "secondary"}>
                          {space.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Owned by {space.owner}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{space.description}</p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md bg-muted p-2">
                        <p className="text-lg font-semibold">{totalGames}</p>
                        <p className="text-[10px] text-muted-foreground">Games</p>
                      </div>
                      <div className="rounded-md bg-muted p-2">
                        <p className="text-lg font-semibold">{activeGames}</p>
                        <p className="text-[10px] text-muted-foreground">Active</p>
                      </div>
                      <div className="rounded-md bg-muted p-2">
                        <p className="text-lg font-semibold">{space.decisions.length}</p>
                        <p className="text-[10px] text-muted-foreground">Decisions</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Portfolio confidence</span>
                        <span className="font-medium">{avgConfidence}%</span>
                      </div>
                      <Progress value={avgConfidence} />
                    </div>

                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 hover:text-foreground">
                        Open space <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
