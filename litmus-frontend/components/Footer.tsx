export default function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <line x1="12" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="15" y2="17.2" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="7.5" y2="19.79" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="7.5" y2="4.21" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="15" y2="6.8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold">
              litmus<span className="text-coral">-</span>lab
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-bone-muted">
            A local CLI profiler for LLM quantization. No cloud APIs. No subscriptions. No
            hallucinated advice.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm text-bone-muted md:items-end">
          <span className="font-mono">$ pip install litmus-lab</span>
          <span className="text-bone-faint">MIT licensed · built for GPU engineers</span>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-bone-faint">
        © {new Date().getFullYear()} litmus-lab, quantize with conviction.
      </div>
    </footer>
  );
}
