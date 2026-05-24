# litmus-lab 

A blazing-fast, zero-dependency local CLI profiler built for benchmarking Large Language Models across different precision formats (**Native FP16 vs INT8 vs INT4**) directly on your GPU.

`litmus-lab` measures:

- GPU VRAM consumption
- Tokens per second (TPS)
- Time to first token (TTFT)
- Linguistic degradation (Perplexity)

After profiling, an **offline mathematical heuristic engine** automatically recommends the best deployment precision for your hardware.

No cloud APIs. No subscriptions. No hallucinated advice.

---

# Features

## Multi-Precision Benchmarking

Profile and compare:

- Native FP16
- INT8 Quantization
- INT4 Quantization (NF4/GPTQ-style)

on the exact same prompt and architecture.

---

## Offline Recommendation Engine

`litmus-lab` contains a local rule-based mathematical evaluation engine.

It automatically determines:

- whether quantization is worth it
- whether the VRAM savings justify the quality loss
- if lower precision actually hurts latency or throughput
- if perplexity degradation becomes unsafe

Example:

- Small models may not benefit from quantization
- Some architectures become unstable in 4-bit
- Certain GPUs gain VRAM savings but lose TPS

The engine evaluates all of this locally and outputs a deployment verdict.

---

## VRAM Isolation & Cleanup

Each profiling worker is completely isolated.

Between benchmark passes, `litmus-lab` aggressively performs:

- CUDA cache cleanup
- Python garbage collection
- IPC memory clearing
- model unloads
- allocator flushes

This prevents hidden memory leaks and false VRAM readings during sequential quantization tests.

---

## 🛡 Context-Length Protection

Some older transformer architectures crash if generation exceeds positional embedding limits.

`litmus-lab` automatically:

- reads `max_position_embeddings`
- scales test sequence lengths safely
- avoids index out-of-bound runtime failures

---

## Beautiful Terminal Dashboard

All benchmark data is rendered using rich terminal tables for clean visualization directly inside the CLI.

Example:

```plaintext
┏━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Quantization ┃ VRAM (MB) ┃ Tokens/sec(TPS) ┃ Time to first token(TTFT) ┃ Perplexity ┃
┡━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━┩
│ Native       │ 7540.12   │ 54.2180         │ 0.0120 sec                │ 12.42      │
│ INT8         │ 4210.45   │ 18.9412         │ 0.0540 sec                │ 12.45      │
│ INT4         │ 2840.88   │ 22.1054         │ 0.0610 sec                │ 12.68      │
└──────────────┴───────────┴─────────────────┴───────────────────────────┴━━━━━━━━━━━━┛
```

---

# Installation

Install globally from PyPI:

```bash
pip install litmus-lab
```

---

# Quick Start

Run a full benchmark pass:

```bash
litmus-lab --model microsoft/Phi-3-mini-4k-instruct --prompt "Write a short poem on a wall"
```

---

# CLI Options

| Flag | Description |
|------|-------------|
| `--model` | Hugging Face model repository path |
| `--prompt` | Prompt text sent to the inference runner |
| `--token` | Optional Hugging Face token for gated models |

---

# Supported Models

Most Hugging Face causal language models are supported, including:

- Phi
- Qwen
- Gemma
- Mistral
- Llama
- OPT
- Falcon
- TinyLlama
- DeepSeek

Examples:

```bash
litmus-lab --model Qwen/Qwen2.5-7B-Instruct --prompt "Explain quantum gravity"
```

```bash
litmus-lab --model google/gemma-2-2b-it --prompt "Write a Linux shell script"
```

```bash
litmus-lab --model meta-llama/Llama-3.1-8B-Instruct --token YOUR_TOKEN --prompt "Explain TCP congestion control"
```

---

# Example System Evaluation Report

```plaintext
==========================================================================================
SYSTEM EVALUATION REPORT FOR microsoft/Phi-3-mini-4k-instruct:

• Recommendation: Deploy INT4 (NF4 format).

• Reason:
  Reclaims a significant 4699.24 MB of GPU VRAM compared to Native FP16 execution.

  The perplexity delta remains tightly controlled (+0.26 PPL), making INT4 the
  most hardware-efficient deployment format for this architecture size.

==========================================================================================
```

---

# How Recommendations Are Calculated

The heuristic engine evaluates:

- VRAM reclaimed
- TPS throughput changes
- TTFT latency penalties
- Perplexity degradation
- architecture stability
- quantization efficiency ratios

The recommendation engine is completely offline and deterministic.

No LLM APIs are used.

---

# Why This Exists

Most quantization tooling tells you:

> "INT4 uses less memory."

But memory reduction alone does not determine deployment quality.

Some quantized models:

- become slower
- lose coherence
- spike TTFT
- destabilize logits
- produce negligible VRAM savings

`litmus-lab` exists to mathematically determine whether quantization is actually worth deploying on YOUR hardware.

---

# Example Workflow

```bash
# Benchmark a 7B instruct model
litmus-lab \
  --model Qwen/Qwen2.5-7B-Instruct \
  --prompt "Explain transformers in simple terms"
```

```bash
# Benchmark a gated Llama model
litmus-lab \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --token hf_xxxxxxxxx \
  --prompt "Write a memory allocator in C"
```

---

# Performance Metrics Explained

## VRAM (MB)

Peak GPU memory allocated during inference.

---

## Tokens/sec (TPS)

Measures generation throughput speed.

Higher is better.

---

## Time To First Token (TTFT)

Measures inference latency before the first generated token appears.

Lower is better.

---

## Perplexity (PPL)

Measures language degradation and prediction uncertainty.

Lower is better.

Small increases are acceptable.

Large jumps indicate quantization damage.

---

# Architecture

`litmus-lab` internally uses:

- PyTorch
- Transformers
- bitsandbytes
- CUDA memory instrumentation
- isolated worker runners
- rich terminal rendering

while exposing a single lightweight CLI interface.

---

# Roadmap

Planned future features:

- ONNX Runtime benchmarking
- GGUF profiling
- AWQ/GPTQ support
- AMD ROCm backend
- CPU-only profiling
- tensor parallel profiling
- JSON/CSV export mode
- benchmark history tracking
- automated regression detection

---

# License

MIT License

Free to use, modify, distribute, and integrate into commercial tooling.

---

# Contributing

Pull requests, issue reports, architecture improvements, and benchmark contributions are welcome.

---

# Disclaimer

Benchmark results vary depending on:

- GPU architecture
- CUDA version
- driver versions
- kernel scheduler state
- model architecture
- tokenizer implementation
- quantization backend

Always validate production deployments independently.