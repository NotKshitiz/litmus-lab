"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const models = [
  "Llama 3", "Phi-3", "Qwen 2.5", "Mistral", "Gemma 2",
  "DeepSeek-V3", "Falcon", "TinyLlama", "CodeLlama", "Zephyr",
  "Vicuna", "OPT", "Pythia", "WizardLM", "Nous-Hermes",
];

function Track({ innerRef }: { innerRef?: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={innerRef} className="flex shrink-0 items-center">
      {models.map((m) => (
        <span key={m} className="inline-flex shrink-0 items-center">
          <span className="whitespace-nowrap text-xl font-medium tracking-tight text-bone/35 transition-colors duration-200 hover:text-bone/75">
            {m}
          </span>
          <span className="mx-7 text-bone-faint/20 select-none">·</span>
        </span>
      ))}
    </div>
  );
}

export default function Models() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-bone-faint/50">
            Works with any HuggingFace causal LM
          </p>
        </Reveal>
      </div>

      <div
        className="relative mt-10 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        }}
      >
        <motion.div
          className="flex"
          animate={trackWidth > 0 ? { x: [0, -trackWidth] } : undefined}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <Track innerRef={trackRef} />
          <Track />
        </motion.div>
      </div>
    </section>
  );
}
