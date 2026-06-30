"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

const COMMAND =
  'litmus-lab --model microsoft/Phi-3-mini-4k-instruct --prompt "Write a short poem"';

type Row = {
  name: string;
  vram: string;
  tps: string;
  ttft: string;
  ppl: string;
  best?: "vram" | "tps";
};

const ROWS: Row[] = [
  { name: "Native", vram: "7540.12", tps: "54.22", ttft: "0.0120s", ppl: "12.42", best: "tps" },
  { name: "INT8", vram: "4210.45", tps: "18.94", ttft: "0.0540s", ppl: "12.45" },
  { name: "INT4", vram: "2840.88", tps: "22.11", ttft: "0.0610s", ppl: "12.68", best: "vram" },
];

export default function AnimatedTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "table" | "verdict">("idle");

  useEffect(() => {
    if (!inView) return;
    if (typed < COMMAND.length) {
      const t = setTimeout(() => setTyped((n) => n + 1), 22);
      return () => clearTimeout(t);
    }
    setPhase("running");
    const t1 = setTimeout(() => setPhase("table"), 1100);
    const t2 = setTimeout(() => setPhase("verdict"), 1100 + ROWS.length * 360 + 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, typed]);

  return (
    <div ref={ref} className="glass relative w-full overflow-hidden rounded-2xl">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-bone-faint">litmus-lab — profiling session</span>
      </div>

      <div className="min-h-[340px] p-5 font-mono text-[13px] leading-relaxed sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-coral">❯</span>
          <span className="break-all text-bone">
            {COMMAND.slice(0, typed)}
            {typed < COMMAND.length && (
              <span className="ml-0.5 inline-block h-4 w-2 -translate-y-px animate-blink rounded-sm bg-coral align-middle" />
            )}
          </span>
        </div>

        <AnimatePresence>
          {phase === "running" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-1 text-bone-muted"
            >
              <p>↳ loading model on <span className="text-coral">cuda</span> …</p>
              <p>↳ warmup · measuring FP16 / INT8 / INT4 <span className="animate-blink">▍</span></p>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "table" || phase === "verdict") && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left">
              <thead>
                <tr className="text-bone-faint">
                  <th className="border-b border-white/10 pb-2 pr-4 font-normal">Quant</th>
                  <th className="border-b border-white/10 pb-2 pr-4 font-normal">VRAM (MB)</th>
                  <th className="border-b border-white/10 pb-2 pr-4 font-normal">TPS</th>
                  <th className="border-b border-white/10 pb-2 pr-4 font-normal">TTFT</th>
                  <th className="border-b border-white/10 pb-2 font-normal">PPL</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <motion.tr
                    key={r.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.36, duration: 0.4 }}
                    className="text-bone"
                  >
                    <td className="border-b border-white/5 py-2 pr-4 font-medium text-coral">{r.name}</td>
                    <td className="border-b border-white/5 py-2 pr-4">
                      {r.vram}
                      {r.best === "vram" && <Tag>−62% VRAM</Tag>}
                    </td>
                    <td className="border-b border-white/5 py-2 pr-4">
                      {r.tps}
                      {r.best === "tps" && <Tag>fastest</Tag>}
                    </td>
                    <td className="border-b border-white/5 py-2 pr-4">{r.ttft}</td>
                    <td className="border-b border-white/5 py-2">{r.ppl}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AnimatePresence>
          {phase === "verdict" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-5 rounded-xl border border-coral/30 bg-coral/[0.08] p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-coral">System verdict</p>
              <p className="mt-2 text-bone">
                Deploy <span className="font-semibold text-coral-bright">INT4 (NF4)</span> — reclaims{" "}
                <span className="text-bone">4699 MB</span> of VRAM with a tightly controlled{" "}
                <span className="text-bone">+0.26 PPL</span> delta.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 rounded-full border border-coral/30 bg-coral/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-coral-bright">
      {children}
    </span>
  );
}
