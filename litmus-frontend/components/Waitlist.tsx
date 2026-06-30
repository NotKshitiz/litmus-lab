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
      <div className="glass relative mx-auto max-w-3xl overflow-hidden rounded-[32px] px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-coral/20 blur-[90px]" />

        <Reveal>
          <p className="relative text-sm font-medium text-coral">Early access</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="relative mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-6xl">
            Stop guessing.
            <br />
            <span className="text-coral-gradient">Join the waitlist.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-bone-muted">
            Be first to profile FP16 · INT8 · INT4 on your own GPU and ship the precision your
            hardware actually wants.
          </p>
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
