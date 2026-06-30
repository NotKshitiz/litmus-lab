"use client";

import { useState } from "react";

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
    <div className="glass-soft inline-flex items-center gap-3 rounded-xl py-1.5 pl-4 pr-1.5 font-mono text-sm">
      <span className="select-none text-bone-faint">$</span>
      <span className="text-bone">{command}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-bone-muted transition-colors hover:border-coral/40 hover:text-coral"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-coral">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
