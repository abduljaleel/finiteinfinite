import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { strategySpaces, getAllDecisions, getStrategyHealth } from "@/lib/data/strategy";
import Link from "next/link";
import { ArrowRight, Clock, Target, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const health = getStrategyHealth();
  const recentDecisions = getAllDecisions().slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Strategy Overview</h1>
        <p className="text-muted-foreground">
          Your strategic position at a glance
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Spaces"
          value={`${health.activeSpaces}/${health.totalSpaces}`}
          description="Strategy spaces in play"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Games"
          value={`${health.activeGames}`}
          description={`of ${health.totalGames} total games tracked`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Pending Decisions"
          value={`${health.pendingDecisions}`}
          description="Awaiting outcome resolution"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg Confidence"
          value={`${health.avgConfidence}%`}
          description="Across all portfolio allocations"
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Strategy Spaces */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Strategy Spaces</h2>
          <Link href="/spaces" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategySpaces.map((space) => {
            const activeGames = space.games.filter((g) => g.status === "active").length;
            const infiniteGames = space.games.filter((g) => g.type === "infinite").length;
            const finiteGames = space.games.filter((g) => g.type === "finite").length;
            const avgConfidence = space.portfolio.length > 0
              ? Math.round(space.portfolio.reduce((a, p) => a + p.confidence, 0) / space.portfolio.length)
              : 0;

            return (
              <Link key={space.id} href={`/spaces/${space.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{space.name}</CardTitle>
                      <Badge variant={space.status === "active" ? "default" : "secondary"}>
                        {space.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{space.timeHorizon} horizon &middot; {space.owner}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{space.description}</p>
                    <div className="flex gap-3 text-xs">
                      <span>{activeGames} active game{activeGames !== 1 ? "s" : ""}</span>
                      <span className="text-muted-foreground">{infiniteGames} infinite &middot; {finiteGames} finite</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Portfolio confidence</span>
                        <span className="font-medium">{avgConfidence}%</span>
                      </div>
                      <Progress value={avgConfidence} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Decisions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Decisions</h2>
          <Link href="/decisions" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentDecisions.map((decision) => (
            <Card key={decision.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{decision.title}</p>
                    <OutcomeBadge outcome={decision.outcome} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {decision.spaceName} &middot; {new Date(decision.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <Link href={`/spaces/${decision.spaceId}`} className="text-muted-foreground hover:text-foreground">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
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
