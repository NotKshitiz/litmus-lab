"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { label: "Why", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Metrics", href: "#metrics" },
  { label: "How it works", href: "#how" },
];

function Flask() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4h6M10 4v6L6 16a2 2 0 0 0 1.8 3h8.4A2 2 0 0 0 18 16l-4-6V4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
      >
        <div className="glass flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-2 pr-2 sm:pl-4">
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral transition-colors group-hover:bg-coral/25">
              <Flask />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              litmus<span className="text-coral">-</span>lab
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-bone-muted transition-colors duration-200 hover:text-bone"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#waitlist"
              className="hidden rounded-full bg-coral px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-12px_rgba(217,100,95,0.6)] transition-all duration-200 hover:bg-coral-deep hover:shadow-[0_10px_28px_-10px_rgba(217,100,95,0.75)] md:inline-flex"
            >
              Join waitlist
            </a>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-bone transition-colors hover:bg-white/5 md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col rounded-r-3xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral">
                    <Flask />
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight">
                    litmus<span className="text-coral">-</span>lab
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-bone transition-colors hover:bg-white/5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-4">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    className="rounded-xl px-4 py-3 text-sm text-bone transition-colors hover:bg-white/5 hover:text-coral"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto p-4">
                <a
                  href="#waitlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full bg-coral px-4 py-3 text-sm font-medium text-white"
                >
                  Join waitlist
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
