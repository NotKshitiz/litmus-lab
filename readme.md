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

`litmus-lab` runs your model through HuggingFace (FP16, INT8, INT4) and vLLM in isolated passes — measuring VRAM, throughput, latency and perplexity on your actual hardware — then outputs a single deployment recommendation.

```
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Mode            ┃ VRAM (MB) ┃ TPS      ┃ TTFT     ┃ Perplexity ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━━┩
│ HF · FP16       │ 7297.83   │ 32.69    │ 0.030s   │ 5.64       │
│ HF · INT8       │ 3846.47   │ 14.26    │ 0.083s   │ 5.81       │
│ HF · INT4 (NF4) │ 2334.96   │ 25.98    │ 0.069s   │ 7.34       │
│ vLLM · FP16     │ 12687.31  │ 111.68   │ 0.448s   │ 5.65       │
└─────────────────┴───────────┴──────────┴──────────┴────────────┘

  Recommendation  Deploy vLLM · FP16
                  3.4× faster than HF · PPL delta 0.01
                  Memory-constrained? HF · INT4 saves 4963 MB (PPL +1.70)
```

---

## Installation

```bash
# HF Transformers only (FP16, INT8, INT4)
pip install litmus-lab

# HF + vLLM backend
pip install "litmus-lab[vllm]"

# HF + AI recommendations via Groq
pip install "litmus-lab[ai]"

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
| `--version` | Print version and exit | — |

### Backend modes

| Mode | What runs |
|------|-----------|
| `hf` | HF Transformers · FP16, INT8, INT4 (NF4) |
| `vllm` | vLLM · FP16 with PagedAttention |
| `all` | All four passes in sequence |

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

### ✅ HF backend — FP16 · INT8 · INT4

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

### ✅ vLLM backend — FP16

Same model coverage as HF. Runs FP16 only. VRAM is higher than HF FP16 due to the KV cache pool but throughput is significantly better under concurrent load.

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

- Python **3.10+**
- CUDA-capable NVIDIA GPU (CPU works but is very slow)
- CUDA **11.8+** or **12.x**

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
| AWQ / GPTQ quantization on vLLM backend | 📋 Planned |

> Want to shape the roadmap? [Open an issue](https://github.com/NotKshitiz/litmus-lab/issues) or join the [waitlist](https://litmuslab.io) for the web platform.

---

## License

MIT
