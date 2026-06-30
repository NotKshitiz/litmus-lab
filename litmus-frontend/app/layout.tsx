import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "litmus-lab — Quantize with conviction",
  description:
    "A blazing-fast, zero-dependency local CLI profiler that benchmarks LLMs across FP16, INT8 and INT4 on your own GPU — then tells you exactly which precision to deploy.",
  keywords: [
    "LLM quantization",
    "INT4",
    "INT8",
    "FP16",
    "GPU benchmarking",
    "perplexity",
    "VRAM",
    "tokens per second",
  ],
  openGraph: {
    title: "litmus-lab — Quantize with conviction",
    description:
      "Benchmark FP16 vs INT8 vs INT4 on your GPU. Get a deterministic, offline deployment verdict.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="grain font-sans antialiased bg-ink text-bone">{children}</body>
    </html>
  );
}
