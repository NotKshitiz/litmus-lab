"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedTerminal from "./AnimatedTerminal";
import CopyCommand from "./CopyCommand";

const ease = [0.16, 1, 0.3, 1] as const;

const live = [
  { label: "HF · 8 quantization modes" },
  { label: "vLLM · FP16, BnB, FP8, AWQ, GPTQ" },
  { label: "NVIDIA GPU" },
];

const building = [
  { label: "GGUF · llama.cpp" },
  { label: "Cost prediction" },
  { label: "Multi-GPU" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.7, 0.1]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden px-5 pt-28 sm:pt-36">
      <div className="mx-auto max-w-5xl text-center">

        {/* badge */}
        <motion.a
          href="https://github.com/NotKshitiz/litmus-lab"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-bone-muted transition-colors hover:text-bone"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
          Open source · free forever
          <span className="ml-1 font-mono text-bone-faint">↗</span>
        </motion.a>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.06, ease }}
          className="mt-8 text-[clamp(2.8rem,7vw,5.5rem)] font-semibold leading-[0.97] tracking-[-0.04em]"
        >
          Run your model.
          <br />
          <span className="text-coral-gradient">Know what to ship.</span>
        </motion.h1>

        {/* subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.14, ease }}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-bone-muted sm:text-xl"
        >
          Benchmark HF and vLLM across FP16 down to 4-bit, NF4, FP4, HQQ, Quanto, AWQ, GPTQ, on your own GPU.
          Get one verdict, which backend, which precision, what it costs.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-full bg-coral px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(217,100,95,0.6)] transition-all duration-200 hover:bg-coral-deep hover:shadow-[0_16px_46px_-14px_rgba(217,100,95,0.8)]"
          >
            Join the waitlist
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <CopyCommand />
        </motion.div>

        {/* live vs building */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {live.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs text-bone-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              {s.label}
            </span>
          ))}
          <span className="text-bone-faint/30 text-lg mx-1">·</span>
          {building.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-xs text-bone-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-coral/50 animate-pulse" />
              {s.label}
            </span>
          ))}
        </motion.div>

        {/* terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.28, ease }}
          className="relative mt-16 [perspective:1400px]"
        >
          <motion.div style={{ y, scale }} className="relative [transform-style:preserve-3d]">
            <motion.div
              style={{ opacity: glowOpacity }}
              className="absolute -inset-8 -z-10 rounded-[48px] bg-coral/15 blur-[90px]"
            />
            <AnimatedTerminal />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
