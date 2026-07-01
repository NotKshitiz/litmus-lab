"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

// Fixed decorative layer, left edge — a single fungal colony creeps upward from a
// bottom-left origin as scrollYProgress advances. The visual mass is solid irregular
// blob colonies (not stroked lines) connected by faint hyphae threads, so it reads as
// filled fungus/mold rather than a plant branch skeleton.
// Self-contained: delete this file + its one import/usage in app/page.tsx to remove entirely.

// Deterministic pseudo-random hash so blobs are irregular but stable across renders.
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Organic irregular blob path, smoothed via the quadratic-through-midpoints technique.
function blobPath(cx: number, cy: number, r: number, seed: number): string {
  const n = 9;
  const points: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const wobble = 0.7 + 0.6 * hash(seed + i * 7.31);
    const rad = r * wobble;
    points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[n - 1], points[0]);
  let d = `M${start[0].toFixed(1)},${start[1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const cur = points[i];
    const next = points[(i + 1) % n];
    const m = mid(cur, next);
    d += `Q${cur[0].toFixed(1)},${cur[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

function Thread({ d, range, progress }: { d: string; range: [number, number]; progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, range, [0, 1]);
  return <motion.path d={d} fill="none" stroke="#d9645f" strokeWidth={1.3} strokeLinecap="round" strokeOpacity={0.3} style={{ pathLength }} />;
}

function Colony({
  cx,
  cy,
  r,
  seed,
  range,
  progress,
  opacity = 0.62,
}: {
  cx: number;
  cy: number;
  r: number;
  seed: number;
  range: [number, number];
  progress: MotionValue<number>;
  opacity?: number;
}) {
  const scale = useTransform(progress, range, [0, 1]);
  const fillOpacity = useTransform(progress, range, [0, opacity]);
  return (
    <motion.path
      d={blobPath(cx, cy, r, seed)}
      fill="#d9645f"
      style={{ scale, fillOpacity, originX: `${cx}px`, originY: `${cy}px` }}
    />
  );
}

function Network({ progress }: { progress: MotionValue<number> }) {
  return (
    <g>
      {/* faint connecting hyphae threads */}
      <Thread d="M20,880 C10,800 40,760 25,680 C15,600 55,580 45,500 C35,420 70,400 60,320 C50,240 85,220 75,140 C68,90 90,70 70,20" range={[0, 0.3]} progress={progress} />
      <Thread d="M25,680 C60,660 90,620 130,600 C160,580 190,540 210,500" range={[0.15, 0.4]} progress={progress} />
      <Thread d="M45,500 C90,480 130,460 160,420" range={[0.3, 0.5]} progress={progress} />
      <Thread d="M60,320 C110,300 150,270 190,240 C220,210 260,190 280,150" range={[0.45, 0.68]} progress={progress} />
      <Thread d="M75,140 C130,120 170,90 200,60" range={[0.62, 0.85]} progress={progress} />

      {/* solid fungal colony masses growing along the network */}
      <Colony cx={30} cy={860} r={17} seed={1} range={[0, 0.08]} opacity={0.7} progress={progress} />
      <Colony cx={40} cy={680} r={11} seed={2} range={[0.12, 0.2]} progress={progress} />
      <Colony cx={55} cy={480} r={10} seed={3} range={[0.26, 0.34]} progress={progress} />
      <Colony cx={65} cy={300} r={9} seed={4} range={[0.4, 0.48]} progress={progress} />
      <Colony cx={210} cy={500} r={13} seed={5} range={[0.36, 0.46]} progress={progress} />
      <Colony cx={200} cy={520} r={8} seed={6} range={[0.42, 0.5]} progress={progress} />
      <Colony cx={160} cy={420} r={11} seed={7} range={[0.46, 0.54]} progress={progress} />
      <Colony cx={280} cy={150} r={13} seed={8} range={[0.62, 0.72]} progress={progress} />
      <Colony cx={215} cy={205} r={8} seed={9} range={[0.66, 0.74]} progress={progress} />
      <Colony cx={200} cy={60} r={12} seed={10} range={[0.78, 0.9]} progress={progress} />
      <Colony cx={70} cy={20} r={9} seed={11} range={[0.86, 0.96]} progress={progress} />
    </g>
  );
}

export default function LichenGrowth() {
  const { scrollYProgress } = useScroll();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 -z-[1] hidden w-[320px] md:block">
      <svg width="320" height="100%" viewBox="0 0 300 900" preserveAspectRatio="xMinYMax slice" className="h-full w-full">
        <Network progress={scrollYProgress} />
      </svg>
    </div>
  );
}
