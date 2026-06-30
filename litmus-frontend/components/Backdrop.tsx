// Fixed ambient mesh-gradient backdrop — Raycast-style colored glow blobs.
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-ink" />

      {/* coral / warm blobs — kept subtle */}
      <div className="absolute -left-[10%] -top-[10%] h-[55vw] w-[55vw] animate-drift rounded-full bg-coral/[0.1] blur-[130px]" />
      <div className="absolute right-[-15%] top-[5%] h-[45vw] w-[45vw] animate-drift-slow rounded-full bg-[#c97a52]/[0.08] blur-[140px]" />
      <div className="absolute left-[20%] top-[45%] h-[40vw] w-[40vw] animate-drift rounded-full bg-[#b05a78]/[0.07] blur-[150px]" />
      <div className="absolute right-[5%] top-[70%] h-[42vw] w-[42vw] animate-drift-slow rounded-full bg-[#5f539e]/[0.06] blur-[160px]" />

      {/* darken lower half so content stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
    </div>
  );
}
