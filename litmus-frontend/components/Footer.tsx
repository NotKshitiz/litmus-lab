export default function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral">
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
        © {new Date().getFullYear()} litmus-lab — quantize with conviction.
      </div>
    </footer>
  );
}
