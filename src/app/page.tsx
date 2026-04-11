import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { ArrowRight, Grid3X3, PieChart, GitBranch, BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              &infin;
            </div>
            <span className="font-semibold text-lg">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">Strategic Decision System</p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Finite and infinite games
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Choose which games to play. Sequence your moves. Win the ones that matter.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/signup">
            <Button size="lg">
              Start mapping your strategy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Thesis */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">The problem</p>
            <h2 className="text-2xl font-bold tracking-tight">
              Most strategic failures come from playing the wrong games, not from playing them badly.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Organizations confuse activity with strategy. They chase finite wins in games that should be played infinitely.
              They over-invest in games they should exit. They make irreversible commitments without evaluating asymmetry.
              Finite Infinite gives you the system to see the board clearly.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="text-3xl font-bold">Strategic instruments</h2>
          <p className="mt-2 text-muted-foreground max-w-xl">Four integrated tools for disciplined strategic thinking.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Grid3X3,
                title: "Game Selection Matrix",
                desc: "Evaluate every initiative across asymmetry of payoff, competitive advantage, time horizon, and reversibility. Classify games as finite or infinite. See which ones deserve your resources.",
              },
              {
                icon: PieChart,
                title: "Portfolio Design",
                desc: "Allocate across Invest, Maintain, Harvest, and Divest categories. Track confidence levels. Ensure your resource allocation matches your stated strategic priorities.",
              },
              {
                icon: GitBranch,
                title: "Scenario Planning",
                desc: "Model 2-4 possible futures per strategy space. Define key assumptions and projected outcomes. Assign probabilities. Compare scenarios side by side.",
              },
              {
                icon: BookOpen,
                title: "Decision Log",
                desc: "Record every strategic decision with rationale, alternatives considered, and outcome tracking. Build institutional memory. Learn from your own strategic history.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border bg-background p-6">
                <feature.icon className="h-8 w-8 text-foreground" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">Process</p>
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Define your spaces", desc: "Create strategy spaces for each domain of strategic play. Set time horizons and ownership." },
              { step: "02", title: "Map your games", desc: "Identify every game you could play. Score each against strategic criteria. Decide which to play, watch, or exit." },
              { step: "03", title: "Decide and track", desc: "Log decisions with full rationale. Track outcomes. Build a strategic feedback loop that sharpens judgment over time." },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <span className="text-4xl font-bold text-muted-foreground/30">{item.step}</span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h2 className="text-3xl font-bold">Stop playing every game. Start winning the right ones.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Finite Infinite gives you the clarity to choose, the discipline to commit, and the structure to learn.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.</span>
          <span>A 12 Cities venture</span>
        </div>
      </footer>
    </div>
  );
}
