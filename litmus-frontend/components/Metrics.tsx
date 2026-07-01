"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const metrics = [
  { label: "VRAM saved", sub: "FP16 → NF4 reclaimed", to: 4963, decimals: 0, suffix: " MB", note: "same model, same GPU", dir: "lower" },
  { label: "Tokens / sec", sub: "vLLM peak throughput", to: 111.68, decimals: 2, suffix: "", note: "3.4× over HF FP16", dir: "higher" },
  { label: "TTFT", sub: "Time to first token (HF)", to: 0.030, decimals: 3, suffix: "s", note: "lower is better", dir: "lower" },
  { label: "Perplexity", sub: "Quality degradation", to: 1.70, decimals: 2, suffix: " Δ", prefix: "+", note: "FP16 → NF4 delta", dir: "lower" },
];

function Pill({ dir }: { dir: string }) {
  const down = dir === "lower";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
        down ? "bg-emerald-400/10 text-emerald-300" : "bg-coral/10 text-coral-bright"
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path
          d={down ? "M12 5v14M6 13l6 6 6-6" : "M12 19V5M6 11l6-6 6 6"}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {down ? "lower" : "higher"}
    </span>
  );
}

export default function Metrics() {
  return (
    <section id="metrics" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Reveal>
        <p className="text-sm font-medium text-coral">Four signals</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
          The numbers that actually <span className="text-coral-gradient">decide a deployment.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass relative flex flex-col justify-between overflow-hidden rounded-3xl p-6"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-bone-faint">{m.label}</span>
              <Pill dir={m.dir} />
            </div>
            <div className="mt-8 text-4xl font-semibold tracking-tight text-bone sm:text-[2.6rem]">
              <CountUp to={m.to} decimals={m.decimals} suffix={m.suffix} prefix={m.prefix} />
            </div>
            <p className="mt-2 text-sm text-bone-muted">{m.sub}</p>
            <p className="mt-1 font-mono text-xs text-coral/80">{m.note}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
