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
  title: "litmus-lab — Run your model. Know what to ship.",
  description:
    "Benchmark HF and vLLM across FP16 down to 4-bit — NF4, FP4, HQQ, Quanto, AWQ, GPTQ — on your own GPU. One command. One verdict — which backend, which precision, what it costs at scale.",
  keywords: [
    "LLM quantization",
    "NF4",
    "GPTQ",
    "AWQ",
    "INT8",
    "FP16",
    "vLLM",
    "GPU benchmarking",
    "perplexity",
    "VRAM",
    "tokens per second",
  ],
  openGraph: {
    title: "litmus-lab — Quantize with conviction",
    description:
      "Benchmark FP16 down to 4-bit quantization and vLLM on your own GPU. Get a deterministic, offline deployment verdict.",
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
