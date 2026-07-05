"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const phases = [
  {
    n: "01",
    total: "03",
    tag: "Install",
    headline: "One command.\nNothing leaves your machine.",
    body: "pip install litmus-lab. No signup, no API key, no telemetry you didn't opt into. It runs entirely on your GPU.",
    code: "pip install 'litmus-lab[all]'",
    output: null,
  },
  {
    n: "02",
    total: "03",
    tag: "Profile",
    headline: "HF and vLLM.\nSide by side. One shot.",
    body: "Pass --backend all and litmus-lab runs HF (FP16, INT8, NF4, FP4, HQQ, Quanto, and more) and vLLM (FP16, BitsAndBytes, FP8) in isolated passes, measuring VRAM, throughput, latency and perplexity for each. Add --awq-model / --gptq-model to include AWQ/GPTQ against a pre-quantized checkpoint.",
    code: 'litmus-lab --model Qwen/Qwen2.5-7B \\\n  --prompt "Explain transformers" \\\n  --backend all',
    output: null,
  },
  {
    n: "03",
    total: "03",
    tag: "Deploy",
    headline: "One verdict.\nNo more guessing.",
    body: "A deterministic engine weighs your measured numbers and outputs a single recommendation, which backend, which precision, and why.",
    code: null,
    output: "  Mode          VRAM      TPS     PPL\n  HF · FP16    7297 MB   32.7    5.64\n  HF · NF4     2334 MB   26.0    7.34\n  vLLM · FP16 12687 MB  111.7    5.65\n\n  → Deploy vLLM · FP16\n    3.4× faster · PPL delta 0.01",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        <Reveal>
          <p className="text-sm font-medium text-coral">How it works</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
            From <span className="font-mono text-coral">pip install</span> to a deployment verdict.
          </h2>
        </Reveal>

        <div className="mt-20 flex flex-col gap-0">
          {phases.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative grid grid-cols-1 gap-8 border-t border-white/[0.06] py-14 lg:grid-cols-[280px_1fr]"
            >
              {/* left — phase number */}
              <div className="flex items-start gap-5 lg:flex-col lg:gap-0">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-[3.5rem] font-semibold leading-none tracking-tighter text-bone/10 transition-colors duration-300 group-hover:text-bone/20">
                    {p.n}
                  </span>
                  <span className="text-lg text-bone/10">/{p.total}</span>
                </div>
                <div className="mt-auto lg:mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-coral/20 bg-coral/[0.07] px-3 py-1 font-mono text-xs text-coral">
                    <span className="h-1 w-1 rounded-full bg-coral" />
                    {p.tag}
                  </span>
                </div>
              </div>

              {/* right — content */}
              <div>
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl" style={{ whiteSpace: "pre-line" }}>
                  {p.headline}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-bone-muted">
                  {p.body}
                </p>

                {p.code && (
                  <pre className="mt-7 overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/50 p-5 font-mono text-sm leading-relaxed">
                    <span className="select-none text-bone-faint">$ </span>
                    <span className="text-coral-bright">{p.code}</span>
                  </pre>
                )}

                {p.output && (
                  <pre className="mt-7 overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/50 p-5 font-mono text-sm leading-relaxed text-bone-muted">
                    {p.output.split("\n").map((line, j) => (
                      <div key={j} className={line.startsWith("  →") ? "mt-3 font-semibold text-coral-bright" : ""}>
                        {line}
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
