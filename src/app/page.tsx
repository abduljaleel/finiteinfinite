import Link from "next/link";
import { appConfig } from "@/lib/config";

/* ────────────────────────────────────────────────────────────────────────
   LODESTAR — "THE ASTROLABE" (celestial-navigation concept, elevated)
   The fixed point of correctness. Agent claims become a constellation of
   proof obligations; each is discharged (proven) or marked unverifiable and
   refused. The whole instrument is ONE responsive viewBox SVG so the chart
   scales as a unit and never breaks apart on small screens.
   ──────────────────────────────────────────────────────────────────────── */

const VIOLET = "#9b7bef";
const VIOLET_HI = "#c4b5fd";
const GOLD = "#e8c266";
const AMBER = "#d8a24a";
const WHITE = "#eef1ff";
const MUTED = "#838aa6";
const FAINT = "#4a5172";
const MONO =
  "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const SERIF = "'Georgia', 'Times New Roman', serif";

const CSS = `
@keyframes ls-twinkle { 0%,100% { opacity:.2 } 50% { opacity:.95 } }
@keyframes ls-pulse {
  0%,100% { opacity:.5; transform:scale(.9); }
  50%     { opacity:1;  transform:scale(1.08); }
}
@keyframes ls-spin { to { transform: rotate(360deg); } }
@keyframes ls-drift {
  0%,100% { transform: translate(-50%,0) scale(1); opacity:.45; }
  50%     { transform: translate(-47%,-3%) scale(1.1); opacity:.7; }
}
@keyframes ls-rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.ls-rise { animation: ls-rise .9s cubic-bezier(.2,.7,.2,1) both; }
.ls-bezel { transform-box: fill-box; transform-origin: center; animation: ls-spin 120s linear infinite; }
.ls-core  { transform-box: fill-box; transform-origin: center; animation: ls-pulse 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ls-twinkle, .ls-bezel, .ls-core, .ls-neb, .ls-rise { animation: none !important; }
}
`;

/* Fixed star-field — deterministic (no Math.random ⇒ no hydration drift) */
const STARS: Array<[number, number, number, number]> = [
  [4, 8, 1, 0.5], [11, 22, 2, 0.35], [7, 41, 1, 0.6], [3, 63, 1, 0.4],
  [9, 78, 2, 0.3], [14, 91, 1, 0.5], [18, 14, 1, 0.45], [22, 35, 1, 0.3],
  [16, 55, 1, 0.55], [24, 70, 2, 0.35], [21, 86, 1, 0.4], [29, 6, 1, 0.5],
  [33, 27, 1, 0.3], [27, 48, 1, 0.45], [31, 64, 1, 0.35], [36, 82, 1, 0.5],
  [44, 4, 2, 0.3], [41, 19, 1, 0.5], [47, 38, 1, 0.35], [52, 9, 1, 0.45],
  [56, 25, 1, 0.3], [49, 72, 1, 0.4], [54, 88, 2, 0.3], [61, 15, 1, 0.5],
  [64, 33, 1, 0.35], [58, 52, 1, 0.45], [66, 67, 1, 0.3], [62, 83, 1, 0.5],
  [71, 7, 1, 0.4], [76, 23, 2, 0.3], [69, 44, 1, 0.5], [74, 60, 1, 0.35],
  [78, 79, 1, 0.45], [83, 12, 1, 0.3], [87, 30, 1, 0.5], [81, 49, 2, 0.35],
  [89, 66, 1, 0.4], [85, 85, 1, 0.3], [93, 20, 1, 0.5], [96, 54, 1, 0.35],
  [91, 74, 1, 0.45], [97, 90, 2, 0.3],
];

/* The proof constellation — a guiding asterism that points at the lodestar.
   x/y are in the 600×600 chart space; the proven nodes form the asterism,
   the lone unverifiable node sits apart, dashed and refused. */
type Verdict = "proven" | "unverifiable";
interface Node {
  n: number;
  label: string;
  verdict: Verdict;
  x: number;
  y: number;
}
const NODES: Node[] = [
  { n: 1, label: "state machine", verdict: "proven", x: 438, y: 150 },
  { n: 2, label: "API contract", verdict: "proven", x: 506, y: 236 },
  { n: 3, label: "memory safety", verdict: "proven", x: 470, y: 348 },
  { n: 4, label: "type soundness", verdict: "proven", x: 388, y: 408 },
  { n: 5, label: "path X", verdict: "unverifiable", x: 150, y: 430 },
];
const CX = 300;
const CY = 300;
const PROVEN = NODES.filter((d) => d.verdict === "proven");

/* 8-point compass star (the lodestar core) centred at (cx,cy) */
function starPoints(cx: number, cy: number, size: number) {
  const RL = size * 0.5;
  const RS = size * 0.17;
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? RL : RS;
    const a = ((i * 22.5 - 90) * Math.PI) / 180;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

/* small 4-point sparkle for a constellation node */
function sparkle(cx: number, cy: number, s: number) {
  return `${cx},${cy - s} ${cx + s * 0.28},${cy - s * 0.28} ${cx + s},${cy} ${cx + s * 0.28},${cy + s * 0.28} ${cx},${cy + s} ${cx - s * 0.28},${cy + s * 0.28} ${cx - s},${cy} ${cx - s * 0.28},${cy - s * 0.28}`;
}

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden antialiased"
      style={{
        background:
          "radial-gradient(140% 120% at 50% -20%, #101935 0%, #0a0f24 38%, #05060f 100%)",
        color: MUTED,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <style>{CSS}</style>

      {/* ── nebula haze + star-field ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="ls-neb absolute left-1/2 top-[-10%] h-[60vh] w-[80vw] blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${VIOLET}26, transparent 60%)`,
            animation: "ls-drift 18s ease-in-out infinite",
          }}
        />
        <div
          className="ls-neb absolute left-[15%] top-[40%] h-[40vh] w-[50vw] blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${GOLD}12, transparent 60%)`,
            animation: "ls-drift 26s ease-in-out infinite",
          }}
        />
        {STARS.map(([l, t, s, o], i) => (
          <span
            key={i}
            className={s >= 2 ? "ls-twinkle absolute rounded-full bg-white" : "absolute rounded-full bg-white"}
            style={{
              left: `${l}%`,
              top: `${t}%`,
              width: s,
              height: s,
              opacity: o,
              animationDuration: s >= 2 ? `${3 + (i % 4)}s` : undefined,
              animationDelay: s >= 2 ? `${(i % 5) * 0.6}s` : undefined,
            }}
          />
        ))}
      </div>

      {/* ── NAV ── */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <polygon points={starPoints(13, 13, 13)} fill={VIOLET} fillOpacity={0.25} stroke={VIOLET_HI} strokeWidth={1} />
            <circle cx="13" cy="13" r="1.6" fill="#fff" />
          </svg>
          <span className="text-[14px] tracking-[0.18em] text-white" style={{ fontFamily: MONO }}>
            LODESTAR
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] sm:inline" style={{ color: FAINT, fontFamily: MONO }}>
            Toronto 🇨🇦 · 43.6°N
          </span>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <Link href="/login" className="transition-colors hover:text-white" style={{ color: MUTED }}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-4 py-2 text-[13px] font-medium transition-transform hover:scale-[1.03]"
            style={{
              color: "#0a0a16",
              background: `linear-gradient(180deg, ${VIOLET_HI}, ${VIOLET})`,
              boxShadow: `0 0 24px ${VIOLET}55`,
            }}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── HERO: message + the astrolabe instrument ── */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-6 pb-16 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:pt-10">
        {/* message */}
        <div className="ls-rise text-center lg:text-left">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em]"
            style={{ borderColor: `${VIOLET}33`, color: VIOLET_HI, fontFamily: MONO }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
            Your true north for correctness
          </div>

          <h1 className="text-[2.6rem] leading-[1.08] text-white sm:text-[3.3rem]" style={{ fontFamily: SERIF }}>
            Ships only what is
            <br />
            <span
              style={{
                background: `linear-gradient(110deg, ${VIOLET_HI}, ${GOLD})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              provably correct.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed lg:mx-0" style={{ color: MUTED }}>
            Lodestar generates <span style={{ color: WHITE }}>formal proofs of correctness</span> for
            agent outputs. Every claim is charted against a proof obligation —
            discharged, or marked unverifiable and refused.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/signup"
              className="rounded-full px-5 py-2.5 text-[13px] font-medium transition-transform hover:scale-[1.03]"
              style={{ color: "#0a0a16", background: `linear-gradient(180deg, ${VIOLET_HI}, ${VIOLET})`, boxShadow: `0 0 26px ${VIOLET}55` }}
            >
              Get started →
            </Link>
            <Link
              href="/login"
              className="rounded-full border px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5"
              style={{ borderColor: "#2a2f4a", color: MUTED, fontFamily: MONO }}
            >
              Sign in
            </Link>
          </div>

          {/* stats */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
            <Stat value="91.9%" label="IMO-ProofBench" accent={GOLD} />
            <Stat value="0%" label="false-positives" accent={VIOLET_HI} />
            <Stat value="100%" label="refuses if unproven" accent={VIOLET_HI} />
          </div>
        </div>

        {/* the instrument */}
        <div className="ls-rise" style={{ animationDelay: ".12s" }}>
          <Astrolabe />
        </div>
      </section>

      {/* ── CONSTELLATION KEY: the verdict log ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <Rule>Proof constellation · this run</Rule>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {NODES.map((d) => {
            const dim = d.verdict === "unverifiable";
            return (
              <div
                key={d.n}
                className="rounded-xl border p-4"
                style={{
                  borderColor: dim ? `${AMBER}30` : `${VIOLET}26`,
                  background: dim ? `${AMBER}08` : `${VIOLET}0b`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full text-[10px]"
                    style={{
                      color: dim ? AMBER : "#0a0a16",
                      background: dim ? "transparent" : VIOLET,
                      border: `1px solid ${dim ? AMBER : VIOLET}`,
                      fontFamily: MONO,
                    }}
                  >
                    {d.n}
                  </span>
                  <span className="text-[13px] text-white" style={{ fontFamily: MONO }}>
                    {d.label}
                  </span>
                </div>
                <div
                  className="mt-3 text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: dim ? AMBER : VIOLET_HI, fontFamily: MONO }}
                >
                  {dim ? "✕ unverifiable" : "✓ proven"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT NAVIGATES (the concept, as a triad) ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <Rule>How it reads the sky</Rule>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Step glyph="✦" title="Chart the course" body="Each claim in the agent's output becomes a formal proof obligation — a fixed star to navigate by." />
          <Step glyph="◈" title="Verify against proof" body="Every obligation is discharged with a machine-checked proof. Nothing is taken on confidence." />
          <Step glyph="⊘" title="Refuse the unprovable" body="If a path can't be proven, it's marked unverifiable and never shipped. Silence over a false 'yes.'" />
        </div>
      </section>

      {/* ── THE HONESTY CONTRAST ── */}
      <section className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 pb-20 sm:px-10">
        <div
          className="w-full rounded-2xl border px-8 py-10"
          style={{ borderColor: `${VIOLET}22`, background: "rgba(12,16,34,0.5)" }}
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3 opacity-70">
              <span className="mt-1 text-[13px]" style={{ color: "#d05a5a", fontFamily: MONO }}>✕</span>
              <p className="text-[16px] italic line-through decoration-[#d05a5a]/50" style={{ color: MUTED, fontFamily: SERIF }}>
                &ldquo;Looks good, approved!&rdquo;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-[13px]" style={{ color: GOLD, fontFamily: MONO }}>✓</span>
              <p className="text-[18px] text-white" style={{ fontFamily: SERIF }}>
                &ldquo;I cannot prove path X. Refusing.&rdquo;
              </p>
            </div>
          </div>
          <p className="mt-7 border-t pt-5 text-center text-[13px] italic" style={{ borderColor: `${VIOLET}1a`, color: MUTED, fontFamily: SERIF }}>
            An honest &lsquo;unverifiable&rsquo; beats a confident &lsquo;verified.&rsquo;
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-3 border-t px-6 py-10 text-center sm:flex-row sm:justify-between" style={{ borderColor: "#171b30" }}>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO }}>
          <span style={{ color: VIOLET_HI }}>{appConfig.name}</span>
          <span style={{ color: FAINT }}>·</span>
          <span style={{ color: MUTED }}>Toronto, Canada</span>
        </div>
        <a
          href="https://abduljaleel.xyz/aletheia/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-[0.12em] transition-colors hover:text-white"
          style={{ color: MUTED, fontFamily: MONO }}
        >
          Part of the Aletheia stack ↗
        </a>
      </footer>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   THE ASTROLABE — one responsive viewBox SVG: graduated rotating bezel,
   declination rings, RA spokes, ecliptic arc, proof-constellation, and the
   glowing lodestar at the fixed centre.
   ════════════════════════════════════════════════════════════════════════ */
function Astrolabe() {
  const decRings = [78, 140, 200, 252];
  const ticks = Array.from({ length: 72 }, (_, i) => i); // every 5°
  const raLabels = [
    { a: 0, t: "00h" },
    { a: 90, t: "06h" },
    { a: 180, t: "12h" },
    { a: 270, t: "18h" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <svg viewBox="0 0 600 600" className="w-full" style={{ display: "block" }} role="img" aria-label="Proof constellation chart">
        <defs>
          <radialGradient id="ls-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.9" />
            <stop offset="35%" stopColor={VIOLET} stopOpacity="0.4" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
          </radialGradient>
          <filter id="ls-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* faint outer disc */}
        <circle cx={CX} cy={CY} r="288" fill="#0a0f24" fillOpacity="0.4" stroke={`${VIOLET}1a`} strokeWidth="1" />

        {/* rotating graduated bezel */}
        <g className="ls-bezel">
          <circle cx={CX} cy={CY} r="278" fill="none" stroke={`${VIOLET}33`} strokeWidth="1" />
          <circle cx={CX} cy={CY} r="262" fill="none" stroke={`${VIOLET}1f`} strokeWidth="1" />
          {ticks.map((i) => {
            const major = i % 6 === 0;
            const a = (i * 5 * Math.PI) / 180;
            const r1 = 278;
            const r2 = major ? 262 : 270;
            return (
              <line
                key={i}
                x1={CX + r1 * Math.cos(a)}
                y1={CY + r1 * Math.sin(a)}
                x2={CX + r2 * Math.cos(a)}
                y2={CY + r2 * Math.sin(a)}
                stroke={major ? VIOLET_HI : VIOLET}
                strokeOpacity={major ? 0.6 : 0.3}
                strokeWidth={major ? 1.4 : 0.8}
              />
            );
          })}
          {raLabels.map(({ a, t }) => {
            const rad = ((a - 90) * Math.PI) / 180;
            return (
              <text
                key={t}
                x={CX + 248 * Math.cos(rad)}
                y={CY + 248 * Math.sin(rad) + 3}
                textAnchor="middle"
                fontSize="11"
                fontFamily={MONO}
                fill={MUTED}
              >
                {t}
              </text>
            );
          })}
        </g>

        {/* declination rings */}
        {decRings.map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={`${VIOLET}18`} strokeWidth="1" />
        ))}

        {/* RA spokes */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX + 252 * Math.cos(a)}
              y2={CY + 252 * Math.sin(a)}
              stroke={`${VIOLET}12`}
              strokeWidth="1"
            />
          );
        })}

        {/* ecliptic — a tilted ellipse for celestial flavour */}
        <ellipse cx={CX} cy={CY} rx="240" ry="120" fill="none" stroke={`${GOLD}22`} strokeWidth="1" strokeDasharray="2 6" transform={`rotate(-18 ${CX} ${CY})`} />

        {/* constellation lines from the lodestar to each proven node */}
        {PROVEN.map((d) => (
          <line key={`c${d.n}`} x1={CX} y1={CY} x2={d.x} y2={d.y} stroke={VIOLET} strokeOpacity="0.28" strokeWidth="1" />
        ))}
        {/* asterism connecting the proven nodes */}
        <polyline
          points={PROVEN.map((d) => `${d.x},${d.y}`).join(" ")}
          fill="none"
          stroke={VIOLET_HI}
          strokeOpacity="0.5"
          strokeWidth="1.4"
        />
        {/* the refused path — dashed, dim */}
        <line
          x1={CX}
          y1={CY}
          x2={NODES[4].x}
          y2={NODES[4].y}
          stroke={AMBER}
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="3 5"
        />

        {/* central lodestar */}
        <circle cx={CX} cy={CY} r="70" fill="url(#ls-glow)" className="ls-core" />
        <polygon
          points={starPoints(CX, CY, 116)}
          fill={VIOLET}
          fillOpacity="0.22"
          stroke={VIOLET_HI}
          strokeWidth="1.2"
          filter="url(#ls-blur)"
        />
        <circle cx={CX} cy={CY} r="7" fill="#fff" />
        <circle cx={CX} cy={CY} r="13" fill="none" stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.7" />

        {/* constellation nodes */}
        {NODES.map((d) => {
          const dim = d.verdict === "unverifiable";
          return (
            <g key={d.n}>
              {dim ? (
                <circle cx={d.x} cy={d.y} r="6.5" fill="#0a0f24" stroke={AMBER} strokeWidth="1.6" />
              ) : (
                <>
                  <polygon points={sparkle(d.x, d.y, 11)} fill={VIOLET_HI} filter="url(#ls-blur)" />
                  <circle cx={d.x} cy={d.y} r="3" fill="#fff" />
                </>
              )}
              <text
                x={d.x + (d.x < CX ? -14 : 14)}
                y={d.y + 4}
                textAnchor={d.x < CX ? "end" : "start"}
                fontSize="13"
                fontFamily={MONO}
                fontWeight={700}
                fill={dim ? AMBER : WHITE}
              >
                {d.n}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.24em]" style={{ color: FAINT, fontFamily: MONO }}>
        4 proven · 1 refused · centred on the lodestar
      </p>
    </div>
  );
}

/* ── helpers ── */
function Stat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="text-center lg:text-left">
      <div className="text-2xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>
        {label}
      </div>
    </div>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] uppercase tracking-[0.28em]" style={{ color: VIOLET_HI, fontFamily: MONO }}>
        {children}
      </span>
      <span className="h-px flex-1" style={{ background: `${VIOLET}1f` }} />
    </div>
  );
}

function Step({ glyph, title, body }: { glyph: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "#1b2038", background: "rgba(12,16,34,0.4)" }}>
      <div className="text-2xl" style={{ color: GOLD }}>{glyph}</div>
      <h3 className="mt-3 text-[15px] text-white" style={{ fontFamily: SERIF }}>{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>{body}</p>
    </div>
  );
}
