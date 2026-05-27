import Link from "next/link";
import { appConfig } from "@/lib/config";

const ACCENT = "#a070e0";

function StarMark({ size = 96 }: { size?: number }) {
  // 8-point lodestar with radiating rays
  const center = size / 2;
  const longArm = size * 0.46;
  const shortArm = size * 0.16;
  const rayOuter = size * 0.5;
  const rayInner = size * 0.36;

  // 8 cardinal/diagonal star points
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? longArm : shortArm;
    points.push(`${center + r * Math.cos(angle - Math.PI / 2)},${center + r * Math.sin(angle - Math.PI / 2)}`);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* Faint outer rays */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * Math.PI) / 8 - Math.PI / 2;
        const x1 = center + rayInner * Math.cos(angle);
        const y1 = center + rayInner * Math.sin(angle);
        const x2 = center + rayOuter * Math.cos(angle);
        const y2 = center + rayOuter * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ACCENT}
            strokeWidth={0.5}
            opacity={0.4}
          />
        );
      })}
      {/* Star body */}
      <polygon points={points.join(" ")} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={1} />
      {/* Inner dot */}
      <circle cx={center} cy={center} r={2.5} fill={ACCENT} />
    </svg>
  );
}

function CheckRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <svg viewBox="0 0 20 20" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" stroke={ACCENT} strokeWidth={2}>
        <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0612] text-slate-200">
      {/* Thin accent line */}
      <div className="h-[2px] w-full" style={{ backgroundColor: ACCENT }} />

      {/* Nav */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <StarMark size={28} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-base text-white tracking-wide">{appConfig.name}</span>
              <span className="hidden sm:inline text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                Toronto
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              lodestar.ca
            </span>
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm border rounded px-3 py-1.5 transition-colors hover:bg-white/5"
              style={{ borderColor: `${ACCENT}55`, color: ACCENT }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-8">
          <StarMark size={96} />
        </div>
        <h1
          className="font-serif text-6xl sm:text-8xl text-white tracking-tight leading-[1.0]"
          style={{ fontFamily: 'ui-serif, Georgia, serif' }}
        >
          Lodestar
        </h1>
        <p className="mt-6 text-xl sm:text-2xl text-slate-300 font-serif italic max-w-2xl mx-auto leading-snug">
          Formal proofs of correctness for agent outputs.
        </p>
        <p className="mt-6 text-sm font-mono text-slate-500 tracking-wide">
          From Toronto — where formal methods meet deep learning.
        </p>
      </section>

      {/* Problem statement */}
      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-600 mb-3">
          The problem
        </p>
        <p className="text-2xl font-serif text-white leading-snug">
          Agent code ships without proof it works.
        </p>
      </section>

      {/* Proof verification panel */}
      <section className="mx-auto max-w-3xl w-full px-4 pb-16">
        <div className="rounded-lg border border-white/10 bg-[#120a1e] overflow-hidden shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Proof Verification
              </span>
            </div>
            <span className="text-xs font-mono text-slate-600">lodestar v0.4.1</span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-mono text-slate-400">PR #4521</p>
                <p className="text-base text-white font-medium">Refactor auth middleware</p>
              </div>
              <span
                className="text-[10px] font-mono px-2 py-1 rounded uppercase tracking-widest"
                style={{ backgroundColor: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
              >
                Verifying
              </span>
            </div>

            <div className="rounded border border-white/5 bg-black/20 px-4 py-2">
              <CheckRow label="State machine" detail="Lean 4 proof attached" />
              <CheckRow label="API contract" detail="conforms to openapi.yaml" />
              <CheckRow label="Memory safety" detail="no leaks across 12 paths" />
            </div>

            {/* Result line */}
            <div
              className="mt-5 rounded border px-4 py-3 flex items-center justify-between"
              style={{ borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}11` }}
            >
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Result</span>
              <span className="text-sm font-mono font-bold tracking-wider" style={{ color: ACCENT }}>
                PROVEN CORRECT
              </span>
            </div>
          </div>
        </div>

        {/* Secondary panel: a refusal case */}
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] px-5 py-4 flex items-start gap-3">
          <svg viewBox="0 0 20 20" className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M10 6v4M10 14h.01M10 1.5L1 17h18L10 1.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
              UNVERIFIABLE
            </p>
            <p className="text-sm text-slate-300 font-mono">cannot prove path-X (timeout branch under network partition)</p>
            <p className="text-xs text-slate-500 mt-1.5">Lodestar refuses to sign what it cannot prove. We tell you what we don&apos;t know.</p>
          </div>
        </div>
      </section>

      {/* Honest vs hallucinated */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-600 mb-3 text-center">
            Confident wrong vs honest
          </p>
          <h2 className="text-center text-3xl font-serif text-white mb-12">
            The difference matters in production.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hallucinated */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                  Other tools
                </span>
              </div>
              <p className="font-serif text-xl text-white mb-3 leading-snug">
                &ldquo;Looks good to me. Approved.&rdquo;
              </p>
              <p className="text-sm text-slate-400 font-mono leading-relaxed">
                LGTM bot signs off on auth changes. Two weeks later the race condition takes down checkout for 47 minutes.
              </p>
              <p className="mt-4 text-xs font-mono text-red-400/80 uppercase tracking-widest">
                Confident. Wrong.
              </p>
            </div>

            {/* Lodestar */}
            <div className="rounded-lg border p-6" style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}08` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: ACCENT }}>
                  Lodestar
                </span>
              </div>
              <p className="font-serif text-xl text-white mb-3 leading-snug">
                &ldquo;Unverifiable: cannot prove path-X.&rdquo;
              </p>
              <p className="text-sm text-slate-400 font-mono leading-relaxed">
                Lodestar proves 14 of 15 paths through the change. It refuses to sign the last one. You investigate. You catch the race before it ships.
              </p>
              <p className="mt-4 text-xs font-mono uppercase tracking-widest" style={{ color: ACCENT }}>
                Honest. Useful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
            {[
              { name: "SymbolicCert", detail: "Cryptographic proof of behavior" },
              { name: "Lean 4 backend", detail: "Theorem-prover under the hood" },
              { name: "State machine verification", detail: "All paths, not samples" },
              { name: "Honest refusal", detail: "No false approvals" },
            ].map((f) => (
              <div key={f.name} className="bg-[#0a0612] p-5">
                <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>
                  {f.name}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-serif text-5xl text-white tabular-nums">91.9%</p>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">
                IMO-ProofBench accuracy
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl text-white tabular-nums">0%</p>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">
                false-positives
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl text-white tabular-nums" style={{ color: ACCENT }}>
                refuses
              </p>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">
                what it can&apos;t prove
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 border-2 rounded px-8 py-4 text-lg font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            Verify your first PR
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto">
        <div className="mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0 h-auto sm:h-16 max-w-6xl items-center justify-between px-4 py-4 sm:py-0">
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span style={{ color: ACCENT }}>{appConfig.name}</span>
            <span>·</span>
            <span>Toronto</span>
            <span>·</span>
            <span>lodestar.ca</span>
          </div>
          <a
            href="https://abduljaleel.xyz/aletheia/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-white border border-white/10 rounded px-3 py-1.5 transition-colors hover:border-white/30"
          >
            Part of the Aletheia stack &#8599;
          </a>
        </div>
      </footer>
    </div>
  );
}
