<div align="center">

<h1>⚗️ litmus-lab</h1>

<p>Benchmark your LLM across quantization formats and backends on your own GPU.<br/>Get one verdict — which precision, which backend, what it costs.</p>

[![PyPI](https://img.shields.io/pypi/v/litmus-lab?color=e05c57&label=PyPI)](https://pypi.org/project/litmus-lab/)
[![Python](https://img.shields.io/pypi/pyversions/litmus-lab?color=3776ab)](https://pypi.org/project/litmus-lab/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/NotKshitiz/litmus-lab?style=flat&color=e05c57)](https://github.com/NotKshitiz/litmus-lab/stargazers)

</div>

---

## What it does

`litmus-lab` runs your model through HuggingFace (FP16, INT8, NF4, FP4, NF4+double-quant, HQQ, Quanto INT8/INT4, plus AWQ/GPTQ against a pre-quantized checkpoint) and vLLM (FP16, BitsAndBytes, FP8, AWQ, GPTQ) in isolated passes — measuring VRAM, throughput, latency and perplexity on your actual hardware — then outputs a single deployment recommendation.

```
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Mode            ┃ VRAM (MB) ┃ TPS      ┃ TTFT     ┃ Perplexity ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━━┩
│ HF · FP16       │ 7297.83   │ 32.69    │ 0.030s   │ 5.64       │
│ HF · INT8       │ 3846.47   │ 14.26    │ 0.083s   │ 5.81       │
│ HF · NF4        │ 2334.96   │ 25.98    │ 0.069s   │ 7.34       │
│ vLLM · FP16     │ 12687.31  │ 111.68   │ 0.448s   │ 5.65       │
└─────────────────┴───────────┴──────────┴──────────┴────────────┘

  Recommendation  Deploy vLLM · FP16
                  3.4× faster than HF · PPL delta 0.01
                  Memory-constrained? HF · NF4 saves 4963 MB (PPL +1.70)
```

---

## Installation

```bash
# HF Transformers backend — FP16, INT8, NF4, FP4, NF4+double-quant, HQQ, Quanto INT8/INT4
pip install litmus-lab

# + vLLM backend (FP16, BitsAndBytes, FP8)
pip install "litmus-lab[vllm]"

# + AI recommendations via Groq
pip install "litmus-lab[ai]"

# + AWQ / GPTQ pre-quantized checkpoint support (HF + vLLM)
pip install "litmus-lab[awq,gptq]"

# Everything
pip install "litmus-lab[all]"
```

> **Note:** vLLM requires Linux or WSL2. It does not run on Windows natively.

---

## Quick start

```bash
litmus-lab \
  --model microsoft/Phi-3-mini-4k-instruct \
  --prompt "Explain the transformer architecture" \
  --backend all
```

---

## Usage

### Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--model` | HuggingFace model repo ID | required |
| `--prompt` | Input prompt | required |
| `--backend` | `hf` · `vllm` · `all` | `hf` |
| `--token` | HuggingFace token for gated models | `None` |
| `--awq-model` | Pre-quantized AWQ checkpoint repo (e.g. `TheBloke/Mistral-7B-v0.1-AWQ`). Enables the HF/vLLM AWQ rows | `None` |
| `--gptq-model` | Pre-quantized GPTQ checkpoint repo (e.g. `TheBloke/Mistral-7B-v0.1-GPTQ`). Enables the HF/vLLM GPTQ rows | `None` |
| `--version` | Print version and exit | — |

### Backend modes

| Mode | What runs |
|------|-----------|
| `hf` | HF Transformers · FP16, INT8, NF4, FP4, NF4+double-quant, HQQ, Quanto INT8/INT4 — plus AWQ/GPTQ if `--awq-model`/`--gptq-model` are given |
| `vllm` | vLLM · FP16, BitsAndBytes, FP8 — plus AWQ/GPTQ if `--awq-model`/`--gptq-model` are given |
| `all` | Both of the above in sequence |

Any mode that hits a missing optional dependency or an unsupported GPU (e.g. FP8 on pre-Hopper hardware) prints a yellow skip line and continues — it won't abort the whole run.

### Examples

```bash
# Compare quantization formats
litmus-lab \
  --model Qwen/Qwen2.5-7B-Instruct \
  --prompt "Explain quantum gravity" \
  --backend hf

# vLLM only
litmus-lab \
  --model mistralai/Mistral-7B-Instruct-v0.3 \
  --prompt "Write a Linux shell script" \
  --backend vllm

# Full benchmark — HF + vLLM side by side
litmus-lab \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --token hf_xxxxxxx \
  --prompt "Explain TCP congestion control" \
  --backend all

# Include AWQ / GPTQ rows against pre-quantized checkpoints
litmus-lab \
  --model teknium/OpenHermes-2.5-Mistral-7B \
  --prompt "Explain the theory of relativity in simple terms" \
  --backend all \
  --awq-model TheBloke/OpenHermes-2.5-Mistral-7B-AWQ \
  --gptq-model TheBloke/OpenHermes-2.5-Mistral-7B-GPTQ
```

---

## AI Recommendations

Set a [Groq](https://console.groq.com) API key (free tier) to get an AI-powered verdict from `llama-3.3-70b-versatile` instead of the built-in heuristic:

```bash
export GROQ_API_KEY=gsk_...
litmus-lab --model Qwen/Qwen2.5-7B --prompt "Hello" --backend all
```

No extra flags needed. Falls back to the offline heuristic automatically if the key is missing, rate limit is hit, or there is no internet.

---

## Metrics explained

| Metric | What it measures |
|--------|-----------------|
| **VRAM (MB)** | Peak GPU memory — model weights + KV cache, measured as a before/after delta |
| **TPS** | Tokens generated per second — generation throughput |
| **TTFT** | Time to first token — how quickly the model starts responding |
| **Perplexity** | Language quality on WikiText-2. Lower = better. Delta >2.0 vs FP16 signals degradation |

---

## Supported models

### ✅ HF backend

Any HuggingFace causal language model loadable via `AutoModelForCausalLM`:

| Family | Models |
|--------|--------|
| **Meta** | Llama 3, 3.1, 3.2, 3.3 |
| **Microsoft** | Phi-3, Phi-3.5, Phi-4 |
| **Alibaba** | Qwen2, Qwen2.5 |
| **Mistral AI** | Mistral 7B, Mixtral 8x7B |
| **Google** | Gemma, Gemma 2 |
| **DeepSeek** | DeepSeek-V2, DeepSeek-V3, DeepSeek-R1 |
| **Community** | Falcon, Yi, TinyLlama, Vicuna, Zephyr, WizardLM, and most fine-tunes |

Gated models (Llama, Gemma) require `--token`.

Quantization modes run against the base repo on the fly — no separate checkpoint needed — except AWQ/GPTQ:

| Mode | Notes |
|------|-------|
| FP16 | native precision, no quantization |
| INT8 | bitsandbytes `load_in_8bit` |
| NF4 | bitsandbytes 4-bit, NormalFloat4 |
| FP4 | bitsandbytes 4-bit, FloatingPoint4 |
| NF4 + double quant | NF4 with nested quantization of the quant constants for extra VRAM savings |
| HQQ | Half-Quadratic Quantization — requires `hqq` (bundled by default). Skips cleanly if your transformers version hasn't finished migrating HQQ's loading path yet (`NotImplementedError`) |
| Quanto INT8 / INT4 | `optimum-quanto` weight-only quantization (bundled by default) |
| AWQ / GPTQ | requires `--awq-model` / `--gptq-model` pointing at a pre-quantized checkpoint, plus `pip install litmus-lab[awq,gptq]` |

### ✅ vLLM backend

Same model coverage as HF. VRAM is generally higher than HF at the same precision due to the KV cache pool, but throughput is significantly better under concurrent load.

| Mode | Notes |
|------|-------|
| FP16 | native precision with PagedAttention |
| BitsAndBytes | on-the-fly quantization of the base checkpoint |
| FP8 | on-the-fly W8A8 — requires a Hopper/Ada-class GPU (H100, L4, RTX 4090+); skips cleanly on older GPUs |
| AWQ / GPTQ | requires `--awq-model` / `--gptq-model` pointing at a pre-quantized checkpoint |

### ❌ Not supported

| | Reason |
|-|--------|
| BERT, RoBERTa, encoder-only models | No autoregressive generation |
| T5, BART, mT5, seq2seq models | Different generation API |
| Models that exceed GPU VRAM at FP16 | No CPU offloading yet |
| vLLM on Windows | Use Linux or WSL2 |
| Multi-GPU / tensor parallel | Not yet implemented |

---

## Requirements

- **Python 3.10+**
- **NVIDIA GPU** with CUDA support (CPU works but is very slow, and quantization gives smaller wins there)
- **NVIDIA driver + CUDA 11.8+ / 12.x** for most GPUs. **Exception: Blackwell-generation GPUs (RTX 50-series, compute capability 12.x)** need **CUDA ≥ 12.9 and driver ≥ 575.51** — the `vllm` backend's FlashInfer kernels fail to initialize below that (`RuntimeError: FlashInfer requires GPUs with sm75 or higher` / `SM 12.x requires CUDA >= 12.9`). The `hf` backend is unaffected and works fine on any CUDA version.
- **Disk space** for whatever model you benchmark — 7B models are roughly 15-30GB on disk depending on dtype — plus the small WikiText-2 dataset used for perplexity
- **`--token`** required for gated models (Llama, Gemma, etc.)
- **vLLM backend** (`--backend vllm` / `all`): Linux or WSL2 only, install with `pip install "litmus-lab[vllm]"` — does not run natively on Windows
- **AWQ/GPTQ pre-quantized modes** (`--awq-model` / `--gptq-model`): need `pip install "litmus-lab[awq,gptq]"` and a separately pre-quantized checkpoint repo (e.g. `TheBloke/*-AWQ`) — these don't run against the base model repo

---

## What's being built 🚧

| Feature | Status |
|---------|--------|
| GGUF / llama.cpp backend (CPU + Mac M-series) | 🔨 In progress |
| Cost prediction (`--target-users`, `--gpu-cost`) | 🔨 In progress |
| Concurrency benchmarking (`--concurrency 1,4,8,16,32`) | 📋 Planned |
| Multi-model comparison in one run | 📋 Planned |
| JSON / HTML report export | 📋 Planned |
| Multi-GPU / tensor parallel benchmarking | 📋 Planned |

> Want to shape the roadmap? [Open an issue](https://github.com/NotKshitiz/litmus-lab/issues) or join the [waitlist](https://litmuslab.io) for the web platform.

---

## License

MIT
