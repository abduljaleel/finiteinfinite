"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { strategySpaces } from "@/lib/data/strategy";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
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

const horizonColors: Record<string, string> = {
  "1yr": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "3yr": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "5yr": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "10yr": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function SpacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Spaces</h1>
          <p className="text-muted-foreground">
            Domains of strategic play. Each space contains the games you choose to play.
          </p>
        </div>
        <Dialog>
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
                <Input id="space-name" placeholder="e.g., Market Expansion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-horizon">Time horizon</Label>
                <Input id="space-horizon" placeholder="e.g., 3yr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-desc">Description</Label>
                <Input id="space-desc" placeholder="Strategic context for this space" />
              </div>
            </div>
            <DialogFooter>
              <Button>Create space</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategySpaces.map((space) => {
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
    </div>
  );
}
