// Fixed ambient backdrop with mesh-gradient blobs and subtle dot-grid texture.
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-ink" />

      {/* ambient blobs */}
      <div className="absolute -left-[10%] -top-[10%] h-[55vw] w-[55vw] animate-drift rounded-full bg-coral/[0.09] blur-[130px]" />
      <div className="absolute right-[-15%] top-[5%] h-[45vw] w-[45vw] animate-drift-slow rounded-full bg-[#c97a52]/[0.07] blur-[140px]" />
      <div className="absolute left-[20%] top-[45%] h-[40vw] w-[40vw] animate-drift rounded-full bg-[#b05a78]/[0.06] blur-[150px]" />
      <div className="absolute right-[5%] top-[70%] h-[42vw] w-[42vw] animate-drift-slow rounded-full bg-[#5f539e]/[0.055] blur-[160px]" />

      {/* hero radial highlight */}
      <div className="absolute left-1/2 top-0 h-[60vh] w-[90vw] max-w-5xl -translate-x-1/2 rounded-full bg-coral/[0.06] blur-[120px]" />

      {/* subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* vignette — darker edges, lighter center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#0a0a0b_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink" />
    </div>
  );
}
