"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedTerminal from "./AnimatedTerminal";
import CopyCommand from "./CopyCommand";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 9]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.15]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden px-5 pt-32 sm:px-8 sm:pt-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 pb-24 lg:grid-cols-2 lg:gap-10">
        {/* left — copy */}
        <div className="text-center lg:text-left">
          <motion.a
            href="#waitlist"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass-soft inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-bone-muted transition-colors hover:text-bone"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
            Now in private beta · join the waitlist
            <span className="text-bone-faint">→</span>
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease }}
            className="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
          >
            Quantize with
            <br />
            <span className="text-coral-gradient">conviction.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-bone-muted lg:mx-0"
          >
            <span className="font-mono text-bone">litmus-lab</span> benchmarks your model across FP16,
            INT8 and INT4 on your own GPU — then a deterministic offline engine tells you exactly which
            precision to ship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 font-medium text-white shadow-[0_12px_40px_-16px_rgba(217,100,95,0.55)] transition-all duration-200 hover:bg-coral-deep hover:shadow-[0_16px_46px_-14px_rgba(217,100,95,0.75)]"
            >
              Join the waitlist
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#how"
              className="glass-soft inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-medium text-bone transition-colors duration-200 hover:border-coral/40 hover:text-coral"
            >
              See it run
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-7 flex justify-center lg:justify-start"
          >
            <CopyCommand />
          </motion.div>
        </div>

        {/* right — product window */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.2, ease }}
          className="relative [perspective:1200px]"
        >
          <motion.div style={{ y, rotateX, scale }} className="relative [transform-style:preserve-3d]">
            <motion.div
              style={{ opacity: glowOpacity }}
              className="absolute -inset-6 -z-10 rounded-[40px] bg-coral/20 blur-[80px]"
            />
            <AnimatedTerminal />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
