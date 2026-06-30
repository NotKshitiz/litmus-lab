"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CopyCommand({ command = "pip install litmus-lab" }: { command?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy command"}
      className="group border-gradient inline-flex items-center gap-3 rounded-xl py-2 pl-4 pr-2 font-mono text-sm transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(217,100,95,0.25)]"
    >
      <span className="text-coral/60">$</span>
      <span className="text-bone">{command}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-bone-faint transition-colors group-hover:border-coral/30 group-hover:text-coral">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.svg
              key="check"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-coral"
            >
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
            >
              <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
