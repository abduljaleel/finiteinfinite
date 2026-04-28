import Link from "next/link";
import { appConfig } from "@/lib/config";

const gamePieces = [
  { row: 1, col: 2, color: "emerald", label: "Enterprise SaaS", type: "playing" },
  { row: 2, col: 5, color: "emerald", label: "API Platform", type: "playing" },
  { row: 4, col: 3, color: "emerald", label: "Data Pipeline", type: "playing" },
  { row: 3, col: 6, color: "amber", label: "Consumer Mobile", type: "considering" },
  { row: 5, col: 1, color: "amber", label: "Marketplace", type: "considering" },
  { row: 5, col: 5, color: "red", label: "Legacy Support", type: "exit" },
];

function GamePiece({ color, label }: { color: string; label: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500 shadow-emerald-500/40",
    amber: "bg-amber-500 shadow-amber-500/40",
    red: "bg-red-500 shadow-red-500/40",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${colorMap[color]} shadow-lg`}
      />
      <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono leading-tight text-center">
        {label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const boardSize = 6;

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a]">
      {/* Thin emerald line at top */}
      <div className="h-[2px] w-full bg-emerald-500" />

      {/* Nav */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/20 border border-emerald-500/40">
              {/* Chess knight SVG */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="currentColor">
                <path d="M19 22H5v-2h14v2M13 2c-1.25 0-2.42.62-3.11 1.66L7 8l2 2 2.1-2.4a1 1 0 011.46-.04l.2.22c.16.2.24.46.2.72L12.5 14H9v2h6l.5-7.03c.07-.98-.26-1.95-.92-2.7L14 5.5l1.5-1.5H18V2h-5z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-white tracking-wide">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm text-emerald-400 border border-emerald-500/40 rounded px-3 py-1.5 hover:bg-emerald-500/10 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight leading-[1.05]">
          Every move is a game.
        </h1>
        <p className="mt-4 text-2xl sm:text-3xl font-medium text-emerald-400 tracking-tight">
          Most play the wrong one.
        </p>
        <p className="mt-6 text-lg text-slate-500">
          Finite Infinite helps you choose.
        </p>
      </section>

      {/* The Game Board */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="relative">
          {/* Board grid */}
          <div
            className="grid border border-white/10 rounded-lg overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
          >
            {Array.from({ length: boardSize * boardSize }).map((_, i) => {
              const row = Math.floor(i / boardSize);
              const col = i % boardSize;
              const isDark = (row + col) % 2 === 0;
              const piece = gamePieces.find((p) => p.row === row && p.col === col);

              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center ${
                    isDark ? "bg-[#0f172a]" : "bg-[#1e293b]"
                  } border border-white/[0.04]`}
                >
                  {piece && <GamePiece color={piece.color} label={piece.label} />}
                </div>
              );
            })}
          </div>

          {/* Board legend */}
          <div className="mt-6 flex items-center justify-center gap-8 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Games you&apos;re playing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Games you&apos;re considering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Games to exit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Finite vs Infinite */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Finite */}
            <div className="pr-8 md:pr-12 pb-12 md:pb-0 md:border-r border-b md:border-b-0 border-emerald-500/30">
              <h2 className="text-xs font-mono tracking-[0.3em] text-slate-600 uppercase mb-4">
                Finite Games
              </h2>
              <p className="text-2xl font-semibold text-white leading-snug">
                Clear rules. Defined end.<br />
                Play to win.
              </p>
              <div className="mt-8 space-y-3">
                {["Product launch", "Fundraise", "Quarter targets"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Infinite */}
            <div className="pl-0 md:pl-12 pt-12 md:pt-0">
              <h2 className="text-xs font-mono tracking-[0.3em] text-slate-600 uppercase mb-4">
                Infinite Games
              </h2>
              <p className="text-2xl font-semibold text-white leading-snug">
                No end. Keep playing.<br />
                Play to keep playing.
              </p>
              <div className="mt-8 space-y-3">
                {["Brand", "Culture", "Trust", "Innovation"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <blockquote className="text-3xl sm:text-4xl font-medium text-white leading-relaxed tracking-tight">
            &ldquo;The only winning move is choosing the right game.&rdquo;
          </blockquote>
          <p className="mt-8 text-sm text-slate-600 font-mono tracking-wide">
            &mdash; The core principle
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 border-2 border-emerald-500 text-emerald-400 rounded px-8 py-4 text-lg font-medium hover:bg-emerald-500/10 transition-colors"
          >
            See your game board
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 text-xs text-slate-600 font-mono">
          <span>&copy; {new Date().getFullYear()} {appConfig.name}</span>
          <span>A 12 Cities venture</span>
        </div>
      </footer>
    </div>
  );
}
