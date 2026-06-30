"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import type { ReactNode } from "react";

function Icon({ d }: { d: ReactNode }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-coral">
      {d}
    </svg>
  );
}

const flagship = {
  title: "Multi-precision benchmarking",
  body: "Profile Native FP16, INT8 and INT4 (NF4) on the exact same prompt and architecture — measured side by side on your GPU, never estimated.",
  icon: <Icon d={<path d="M4 19V9M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />} />,
};

const bars = [
  { label: "FP16", mb: "7540 MB", w: "100%" },
  { label: "INT8", mb: "4210 MB", w: "56%" },
  { label: "INT4", mb: "2841 MB", w: "38%" },
];

const features = [
  {
    title: "Offline recommendation engine",
    body: "A deterministic, rule-based heuristic weighs VRAM, speed and perplexity to output a single deployment verdict. No APIs. No hallucinations.",
    icon: (
      <Icon
        d={
          <>
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        }
      />
    ),
  },
  {
    title: "VRAM isolation & cleanup",
    body: "Every pass runs in an isolated worker with aggressive CUDA cache flushing, GC and IPC clearing — so memory leaks never fake your VRAM readings.",
    icon: (
      <Icon
        d={
          <>
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 6V4M12 6V4M17 6V4M7 18v2M12 18v2M17 18v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        }
      />
    ),
  },
  {
    title: "Context-length protection",
    body: "Reads max_position_embeddings and scales test sequences safely — so fragile older architectures never crash on out-of-bound indices.",
    icon: (
      <Icon
        d={
          <>
            <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        }
      />
    ),
  },
  {
    title: "Beautiful terminal dashboard",
    body: "Every benchmark renders as a clean, rich-formatted table right in your CLI — readable at a glance, copy-paste ready for a report.",
    icon: (
      <Icon
        d={
          <>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9l3 2.5L7 14M12 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        }
      />
    ),
  },
];

const cardClass =
  "glass group relative overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_28px_80px_-50px_rgba(0,0,0,0.9)]";

export default function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium text-coral">Capabilities</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
            Everything you need to ship quantized — <span className="text-coral-gradient">with proof.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* flagship — full width with inline VRAM comparison */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={`${cardClass} md:col-span-2`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-coral/15 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10">{flagship.icon}</div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{flagship.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-bone-muted">{flagship.body}</p>
              </div>
              <div className="space-y-3">
                {bars.map((b) => (
                  <div key={b.label} className="flex items-center gap-3 font-mono text-xs">
                    <span className="w-10 shrink-0 text-bone-faint">{b.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: b.w }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-coral-deep to-coral"
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-bone">{b.mb}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 2x2 grid */}
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cardClass}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-coral/15 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10">{f.icon}</div>
              <h3 className="relative mt-5 text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="relative mt-3 max-w-md leading-relaxed text-bone-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
