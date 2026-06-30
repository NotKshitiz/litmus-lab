"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const failures = [
  { k: "become slower", d: "Lower precision can tank throughput instead of helping it." },
  { k: "lose coherence", d: "Weights scramble and generations quietly fall apart." },
  { k: "spike TTFT", d: "Latency to first token balloons under some kernels." },
  { k: "pick the wrong backend", d: "vLLM can be 3× faster than HF — or crash your GPU. You won't know until you measure." },
  { k: "overspend on inference", d: "Running FP16 on HF when vLLM INT4 would do is money left on the table every request." },
];

export default function Problem() {
  return (
    <section id="problem" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Reveal>
        <p className="text-sm font-medium text-coral">The problem</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
          Every tool tells you{" "}
          <span className="text-bone-muted">“INT4 uses less memory.”</span>
          <br />
          <span className="text-coral-gradient">That number decides nothing.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-bone-muted">
          Memory reduction alone doesn&apos;t determine deployment quality — and neither does picking
          HF or vLLM at random. The same model on the wrong backend or wrong precision can quietly:
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {failures.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_70px_-45px_rgba(0,0,0,0.9)]"
          >
            <div className="font-mono text-2xl font-semibold text-coral/40">0{i + 1}</div>
            <p className="mt-3 font-medium text-bone">{f.k}</p>
            <p className="mt-2 text-sm leading-relaxed text-bone-muted">{f.d}</p>
          </motion.div>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mx-auto mt-12 max-w-2xl text-center text-lg text-bone">
          litmus-lab exists to <span className="text-coral">mathematically</span> decide which backend,
          which precision, and what it costs — measured on{" "}
          <span className="underline decoration-coral/50 underline-offset-4">your</span> hardware, not someone else&apos;s.
        </p>
      </Reveal>
    </section>
  );
}
