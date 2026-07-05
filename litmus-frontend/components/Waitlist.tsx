"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT;

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("That doesn't look like a valid email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        const key = "litmus-waitlist";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (!list.includes(email)) list.push(email);
        localStorage.setItem(key, JSON.stringify(list));
        await new Promise((r) => setTimeout(r, 700));
      }
      setStatus("success");
    } catch {
      setError("Something went wrong. Try again in a moment.");
      setStatus("error");
    }
  }

  return (
    <section id="waitlist" className="relative px-5 py-28">
      <div className="border-gradient relative mx-auto max-w-3xl overflow-hidden rounded-[32px] px-6 py-16 text-center sm:px-12" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(24px)" }}>
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-full bg-coral/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full bg-[#b05a78]/10 blur-[80px]" />

        <Reveal>
          <p className="relative text-sm font-medium text-coral">Early access</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="relative mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-6xl">
            The CLI is free.
            <br />
            <span className="text-coral-gradient">The platform is next.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-bone-muted">
            litmus-lab is available today, install it, run a benchmark, get a verdict.
            The waitlist is for early access to the web platform: benchmark history, team dashboards,
            new-model alerts, and cost prediction at scale.
          </p>
        </Reveal>

        {/* what you get pills */}
        <Reveal delay={0.12}>
          <div className="relative mx-auto mt-7 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-bone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-coral">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              CLI, free forever
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/5 px-4 py-2 text-sm text-bone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-coral">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Platform early access
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/5 px-4 py-2 text-sm text-bone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-coral">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              New-model alerts
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/5 px-4 py-2 text-sm text-bone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-coral">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cost autopilot (Stage 3)
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto mt-10 max-w-md">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 rounded-full border border-coral/40 bg-coral/10 px-6 py-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="font-medium text-bone">You&apos;re on the list. We&apos;ll be in touch.</span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@gpu-rig.dev"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    className="w-full flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-bone placeholder:text-bone-faint outline-none transition-colors focus:border-coral/60"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 font-medium text-white shadow-[0_12px_40px_-16px_rgba(217,100,95,0.55)] transition-all duration-200 hover:bg-coral-deep hover:shadow-[0_16px_46px_-14px_rgba(217,100,95,0.75)] disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Joining…
                      </span>
                    ) : (
                      "Get early access"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="h-6">
              {status === "error" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-coral-bright">
                  {error}
                </motion.p>
              )}
              {status !== "error" && status !== "success" && (
                <p className="mt-3 text-xs text-bone-faint">No spam. Just one email when it&apos;s ready.</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
