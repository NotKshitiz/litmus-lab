"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const stages = [
  {
    n: "01",
    status: "Available now",
    live: true,
    title: "The CLI",
    tagline: "Free. Runs on your GPU. No signup.",
    steps: [
      "pip install litmus-lab on any NVIDIA GPU",
      "Run --backend all — benchmarks HF (FP16, INT8, NF4, FP4, HQQ, Quanto) and vLLM (FP16, BitsAndBytes, FP8) in one shot, plus AWQ/GPTQ on both",
      "Get a single verdict: which backend, which precision, and why",
    ],
  },
  {
    n: "02",
    status: "Coming soon",
    live: false,
    title: "The Platform",
    tagline: "$199/mo · team dashboards · new-model alerts",
    steps: [
      "Benchmark results auto-upload to your team dashboard",
      "Get alerted when a newer model beats what you're running in production",
      "Share reports, track cost across GPU upgrades, predict $/1M tokens at your concurrency",
    ],
  },
  {
    n: "03",
    status: "Coming soon",
    live: false,
    title: "Cost Autopilot",
    tagline: "$2K–10K/mo · monitors your live deployment",
    steps: [
      "A lightweight agent runs next to your vLLM in production",
      "Streams live GPU utilization, request concurrency, and cost per request",
      "Surfaces the exact format change to cut your bill — before your cloud invoice does",
    ],
  },
];

function Node({ live, n }: { live: boolean; n: string }) {
  return (
    <div className="relative z-10 shrink-0">
      {live ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-white shadow-[0_0_0_5px_rgba(217,100,95,0.14)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-soft font-mono text-sm text-bone-faint">
          {n}
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Reveal>
        <p className="text-sm font-medium text-coral">Roadmap</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
          From a CLI to your <span className="text-coral-gradient">cost autopilot.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-bone-muted">
          The CLI stays free, always. Everything we build next is designed to save your team real money.
        </p>
      </Reveal>

      {/* stage cards */}
      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stages.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={`glass relative flex flex-col overflow-hidden rounded-3xl p-7 ${s.live ? "border-coral/20" : ""}`}
          >
            {s.live && (
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coral/10 blur-2xl" />
            )}

            {/* header */}
            <div className="relative flex items-start justify-between gap-3">
              <Node live={s.live} n={s.n} />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  s.live ? "bg-coral/15 text-coral-bright" : "bg-white/5 text-bone-muted"
                }`}
              >
                {s.live && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
                  </span>
                )}
                {s.status}
              </span>
            </div>

            {/* title */}
            <h3 className="relative mt-5 text-xl font-semibold tracking-tight">{s.title}</h3>
            <p className="relative mt-1 font-mono text-xs text-coral/70">{s.tagline}</p>

            {/* user journey steps */}
            <ul className="relative mt-5 flex flex-col gap-3">
              {s.steps.map((step, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-bone-muted">
                  <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[9px] text-bone-faint">
                    {j + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* autopilot alert infographic */}
      <Reveal delay={0.1}>
        <div className="glass relative mt-8 overflow-hidden rounded-3xl p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/10 blur-3xl" />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs text-coral-bright">
                <span>🔔</span> Stage 3 autopilot alert
              </div>
              <p className="mt-4 text-xl font-medium leading-snug sm:text-2xl">
                DeepSeek-V3 matches your current Llama-3.1-70B quality at{" "}
                <span className="text-coral">58% of the cost.</span>
              </p>
              <p className="mt-3 text-bone-muted">
                Re-benchmark it on your own hardware before you switch — one click, no guesswork.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              <div className="bg-ink-soft/80 p-5">
                <p className="text-xs uppercase tracking-wider text-bone-faint">Current spend</p>
                <p className="mt-2 text-2xl font-semibold text-bone">
                  $<CountUp to={82000} decimals={0} />
                </p>
                <p className="text-xs text-bone-faint">/ month</p>
              </div>
              <div className="bg-ink-soft/80 p-5">
                <p className="text-xs uppercase tracking-wider text-coral">Projected savings</p>
                <p className="mt-2 text-2xl font-semibold text-coral-bright">
                  $<CountUp to={34440} decimals={0} />
                </p>
                <p className="text-xs text-bone-faint">/ month</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
