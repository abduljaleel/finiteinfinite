import Link from "next/link";
import { appConfig } from "@/lib/config";

const ACCENT = "#a070e0";
const MONO =
  "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

// ---- Fixed star-field (no Math.random) -----------------------------------
// Each entry: [left%, top%, sizePx, opacity]
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

// ---- Constellation nodes placed RADIALLY around the central star --------
// angleDeg measured clockwise from 12 o'clock; radius is the distance from
// the star centre (in px on the orbital layer). Each carries a verdict.
type Verdict = "proven" | "unverifiable";
const NODES: Array<{
  label: string;
  verdict: Verdict;
  angle: number;
  radius: number;
}> = [
  { label: "state machine", verdict: "proven", angle: -52, radius: 250 },
  { label: "API contract", verdict: "proven", angle: 58, radius: 270 },
  { label: "memory safety", verdict: "proven", angle: 158, radius: 255 },
  { label: "path X", verdict: "unverifiable", angle: -150, radius: 240 },
];

// orbital layer is 720x720; centre at (360,360)
const ORBIT = 720;
const CX = ORBIT / 2;
const CY = ORBIT / 2;

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function Lodestar({ size = 132 }: { size?: number }) {
  // 8-pointed star / compass rose with a soft glow
  const c = size / 2;
  const RL = size * 0.48; // long points
  const RS = size * 0.17; // short points
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? RL : RS;
    const a = ((i * 22.5 - 90) * Math.PI) / 180;
    pts.push(`${c + r * Math.cos(a)},${c + r * Math.sin(a)}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ls-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.95" />
          <stop offset="40%" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={c} fill="url(#ls-core)" />
      <polygon
        points={pts.join(" ")}
        fill={ACCENT}
        fillOpacity={0.22}
        stroke={ACCENT}
        strokeWidth={1}
        strokeOpacity={0.85}
      />
      <circle cx={c} cy={c} r={size * 0.045} fill="#ffffff" />
      <circle cx={c} cy={c} r={size * 0.09} fill="none" stroke={ACCENT} strokeWidth={1} strokeOpacity={0.6} />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#06060a] text-slate-300 antialiased"
      style={{
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* ---- STAR-FIELD (fixed coordinates) ---- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map(([l, t, s, o], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${l}%`,
              top: `${t}%`,
              width: s,
              height: s,
              opacity: o,
            }}
          />
        ))}
      </div>

      {/* ---- thin top auth row, kept sparse ---- */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-7 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Lodestar size={24} />
          <span
            className="text-[14px] tracking-[0.16em] text-white"
            style={{ fontFamily: MONO }}
          >
            LODESTAR
          </span>
          <span
            className="hidden text-[10px] uppercase tracking-[0.3em] text-slate-600 sm:inline"
            style={{ fontFamily: MONO }}
          >
            Toronto 🇨🇦
          </span>
        </div>
      </header>

      {/* ============================================================
          THE CELESTIAL FIELD — everything orbits one bright centre.
          A fixed-size orbital layer is centred on the page; the star,
          its rings, the constellation lines, and the verdict nodes are
          all absolutely placed relative to that single focal point.
      ============================================================ */}
      <section className="relative z-10 flex justify-center px-4 pt-6 pb-4">
        <div
          className="relative"
          style={{ width: ORBIT, maxWidth: "100%", height: ORBIT }}
        >
          {/* concentric rings emanating from the star */}
          <div aria-hidden="true" className="absolute inset-0">
            {[150, 250, 350].map((d) => (
              <span
                key={d}
                className="absolute rounded-full border"
                style={{
                  left: CX,
                  top: CY,
                  width: d * 2,
                  height: d * 2,
                  transform: "translate(-50%, -50%)",
                  borderColor: `${ACCENT}1f`,
                }}
              />
            ))}
          </div>

          {/* constellation lines: SVG from centre to each node */}
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${ORBIT} ${ORBIT}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {NODES.map((n) => {
              const p = polar(n.angle, n.radius);
              const dim = n.verdict === "unverifiable";
              return (
                <line
                  key={n.label}
                  x1={CX}
                  y1={CY}
                  x2={p.x}
                  y2={p.y}
                  stroke={dim ? "#8a8f9c" : ACCENT}
                  strokeWidth={0.75}
                  strokeOpacity={dim ? 0.3 : 0.45}
                  strokeDasharray={dim ? "3 4" : undefined}
                />
              );
            })}
          </svg>

          {/* THE STAR + the short headline that sits around it */}
          <div
            className="absolute flex flex-col items-center text-center"
            style={{
              left: CX,
              top: CY,
              transform: "translate(-50%, -50%)",
              width: 360,
              maxWidth: "86vw",
            }}
          >
            <Lodestar size={132} />
            <h1
              className="mt-5 text-[24px] leading-[1.25] text-white sm:text-[28px]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Ships only what is
              <br />
              provably correct.
            </h1>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-500">
              Formal proofs of correctness for agent outputs.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/login"
                className="border px-4 py-1.5 text-[12px] tracking-wide transition-colors hover:bg-white/5"
                style={{ borderColor: "#2a2a3a", color: "#b8b8c8", fontFamily: MONO }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="border px-4 py-1.5 text-[12px] tracking-wide transition-colors hover:bg-white/5"
                style={{ borderColor: `${ACCENT}66`, color: ACCENT, fontFamily: MONO }}
              >
                Get started
              </Link>
            </div>
          </div>

          {/* THE VERDICT NODES, radially placed around the star */}
          {NODES.map((n) => {
            const p = polar(n.angle, n.radius);
            const dim = n.verdict === "unverifiable";
            const onLeft = p.x < CX;
            return (
              <div
                key={n.label}
                className="absolute"
                style={{
                  left: p.x,
                  top: p.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="flex items-center gap-2 whitespace-nowrap"
                  style={{ flexDirection: onLeft ? "row-reverse" : "row" }}
                >
                  {/* node dot */}
                  <span
                    className="block rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: dim ? "#0a0a12" : ACCENT,
                      border: `2px solid ${dim ? "#c79a3f" : ACCENT}`,
                      boxShadow: dim ? "none" : `0 0 14px ${ACCENT}`,
                    }}
                  />
                  <div style={{ textAlign: onLeft ? "right" : "left" }}>
                    <div
                      className="text-[12px] text-white"
                      style={{ fontFamily: MONO }}
                    >
                      {n.label}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.16em]"
                      style={{
                        color: dim ? "#c79a3f" : ACCENT,
                        fontFamily: MONO,
                      }}
                    >
                      {dim ? "✕ unverifiable" : "✓ proven"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          THE HONESTY CONTRAST — one quiet panel, two stacked quotes
      ============================================================ */}
      <section className="relative z-10 flex flex-col items-center px-6 pb-10">
        <div className="w-full max-w-md space-y-4">
          {/* hallucinated model */}
          <div className="flex items-start gap-3 opacity-70">
            <span
              className="mt-1 text-[13px]"
              style={{ color: "#d05a5a", fontFamily: MONO }}
            >
              ✕
            </span>
            <p
              className="text-[15px] italic text-slate-500 line-through decoration-[#d05a5a]/50"
              style={{ fontFamily: "Georgia, serif" }}
            >
              &ldquo;Looks good, approved!&rdquo;
            </p>
          </div>
          {/* lodestar */}
          <div className="flex items-start gap-3">
            <span
              className="mt-1 text-[13px]"
              style={{ color: ACCENT, fontFamily: MONO }}
            >
              ✓
            </span>
            <p
              className="text-[16px] text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              &ldquo;I cannot prove path X. Refusing.&rdquo;
            </p>
          </div>
          <p className="pt-1 text-center text-[12px] italic text-slate-600">
            An honest &lsquo;unverifiable&rsquo; beats a confident &lsquo;verified.&rsquo;
          </p>
        </div>
      </section>

      {/* ---- quiet stats line ---- */}
      <section className="relative z-10 flex justify-center px-6 pb-16">
        <p
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500"
          style={{ fontFamily: MONO }}
        >
          <span style={{ color: ACCENT }}>91.9% IMO-ProofBench</span>
          <span className="text-slate-700">·</span>
          <span>0% false-positives</span>
          <span className="text-slate-700">·</span>
          <span>refuses what it can&apos;t prove</span>
        </p>
      </section>

      {/* ============================================================
          FOOTER — centred, sparse
      ============================================================ */}
      <footer className="relative z-10 flex flex-col items-center gap-2 px-6 pb-10 text-center">
        <div
          className="text-[11px] uppercase tracking-[0.22em] text-slate-600"
          style={{ fontFamily: MONO }}
        >
          <span style={{ color: ACCENT }}>{appConfig.name}</span>
          <span className="mx-2 text-slate-700">·</span>
          <span>Toronto</span>
        </div>
        <a
          href="https://abduljaleel.xyz/aletheia/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-[0.12em] text-slate-500 transition-colors hover:text-white"
          style={{ fontFamily: MONO }}
        >
          Part of the Aletheia stack ↗
        </a>
      </footer>
    </main>
  );
}
