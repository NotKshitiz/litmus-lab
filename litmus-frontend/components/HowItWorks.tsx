"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const steps = [
  { n: "01", title: "Install", body: "One pip command. Zero config, no API keys, nothing leaves your machine.", code: "pip install litmus-lab" },
  { n: "02", title: "Profile", body: "Point it at any Hugging Face causal LM and a prompt. Pass --backend all to run HF (FP16/INT8/INT4) and vLLM side by side in isolated passes.", code: 'litmus-lab --model Qwen/Qwen2.5-7B \\\n  --prompt "Explain transformers" \\\n  --backend all' },
  { n: "03", title: "Deploy with a verdict", body: "Read the table and get a single recommendation — which backend, which precision, and whether vLLM's throughput gain justifies the VRAM cost.", code: "→ Recommendation: Deploy vLLM · FP16\n  3.4× faster · PPL delta 0.01" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-28">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium text-coral">Three steps</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
            From <span className="font-mono text-coral">pip install</span> to a deployment verdict.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="glass flex flex-col rounded-3xl p-8"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/10 font-mono text-sm font-semibold text-coral">
                {s.n}
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-bone-muted">{s.body}</p>
              <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-coral-bright">
                <span className="select-none text-bone-faint">$ </span>
                {s.code}
              </pre>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
