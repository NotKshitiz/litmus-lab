"use client";

import Reveal from "./Reveal";

const models = ["Phi", "Qwen", "Gemma", "Mistral", "Llama", "OPT", "Falcon", "TinyLlama", "DeepSeek"];

function Track() {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {models.map((m) => (
        <span
          key={m}
          className="flex items-center gap-3 whitespace-nowrap text-2xl font-semibold tracking-tight text-bone-muted transition-colors hover:text-coral sm:text-3xl"
        >
          {m}
          <span className="h-1.5 w-1.5 rounded-full bg-coral/50" />
        </span>
      ))}
    </div>
  );
}

export default function Models() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-sm text-bone-faint">
            Works with most Hugging Face causal language models
          </p>
        </Reveal>
      </div>
      <div className="mask-fade-x relative mt-10 flex overflow-hidden">
        <div className="flex animate-marquee">
          <Track />
          <Track />
        </div>
      </div>
    </section>
  );
}
