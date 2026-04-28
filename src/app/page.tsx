import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { ArrowRight, Grid3X3, PieChart, GitBranch, BookOpen, Target, Shield, Swords, Eye } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a]">
      {/* Nav */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white text-sm font-bold">
              &infin;
            </div>
            <span className="font-semibold text-lg text-white">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-24 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400 tracking-wide">Strategic Decision System</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl text-white leading-[1.1]">
            Finite and infinite games
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Choose which games to play. Sequence your moves. Win the ones that matter.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base">
                Start mapping your strategy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-white/5 h-12 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Game Matrix Preview */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mb-3">The framework</p>
            <h2 className="text-3xl font-bold text-white">See the board before you play</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">Every initiative falls into one of four quadrants. Know which game you are playing before you commit resources.</p>
          </div>
          <div className="grid grid-cols-2 gap-1 max-w-2xl mx-auto">
            {[
              { label: "High Stakes Finite", example: "Product launch", sublabel: "Win decisively, then exit", icon: Target, color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" },
              { label: "High Stakes Infinite", example: "Culture building", sublabel: "Play to keep playing", icon: Shield, color: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
              { label: "Low Stakes Finite", example: "Vendor negotiation", sublabel: "Quick wins, move on", icon: Swords, color: "bg-slate-500/15 border-slate-500/30 text-slate-400" },
              { label: "Low Stakes Infinite", example: "Community presence", sublabel: "Maintain, don't over-invest", icon: Eye, color: "bg-purple-500/15 border-purple-500/30 text-purple-400" },
            ].map((q) => (
              <div key={q.label} className={`rounded-lg border p-6 ${q.color}`}>
                <q.icon className="h-6 w-6 mb-3" />
                <h3 className="font-semibold text-white text-sm">{q.label}</h3>
                <p className="text-xs mt-1 opacity-70">{q.sublabel}</p>
                <div className="mt-3 px-2 py-1 rounded bg-white/5 text-xs font-mono">{q.example}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Asymmetry x Time Horizon</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mb-3">Capabilities</p>
          <h2 className="text-3xl font-bold text-white">Strategic instruments</h2>
          <p className="mt-2 text-slate-400 max-w-xl">Four integrated tools for disciplined strategic thinking.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
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
              <div key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-6 hover:border-emerald-500/30 transition-colors">
                <feature.icon className="h-8 w-8 text-emerald-400" />
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="text-5xl text-emerald-500/20 mb-4">&ldquo;</div>
          <blockquote className="text-2xl font-medium text-white leading-relaxed italic">
            The only choice that matters is which game you are playing.
          </blockquote>
          <p className="mt-6 text-sm text-slate-500 tracking-wide">Inspired by James Carse, Finite and Infinite Games</p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mb-3">Process</p>
          <h2 className="text-3xl font-bold text-white">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Define your spaces", desc: "Create strategy spaces for each domain of strategic play. Set time horizons and ownership." },
              { step: "02", title: "Map your games", desc: "Identify every game you could play. Score each against strategic criteria. Decide which to play, watch, or exit." },
              { step: "03", title: "Decide and track", desc: "Log decisions with full rationale. Track outcomes. Build a strategic feedback loop that sharpens judgment over time." },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <span className="text-5xl font-bold text-emerald-500/20">{item.step}</span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-white">Stop playing every game.<br />Start winning the right ones.</h2>
          <p className="mt-4 text-lg text-slate-400">
            Clarity to choose. Discipline to commit. Structure to learn.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 text-sm text-slate-500">
          <span>&copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.</span>
          <span>A 12 Cities venture</span>
        </div>
      </footer>
    </div>
  );
}
