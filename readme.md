# litmus-lab

A CLI tool for benchmarking LLM inference across quantization formats and backends. Load a model once per format, measure VRAM, throughput, latency, and quality side by side, then get a deployment recommendation based on the actual numbers.

```
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Mode            ┃ VRAM (MB) ┃ Tokens/sec (TPS) ┃ Time to First Token (TTFT) ┃ Perplexity ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━┩
│ HF · FP16       │ 7297.83   │ 32.69            │ 0.0300 sec                 │ 5.64       │
│ HF · INT8       │ 3846.47   │ 14.26            │ 0.0828 sec                 │ 5.81       │
│ HF · INT4 (NF4) │ 2334.96   │ 25.98            │ 0.0686 sec                 │ 7.34       │
│ vLLM · FP16     │ 12687.31  │ 111.68           │ 0.4477 sec                 │ 5.65       │
└─────────────────┴───────────┴──────────────────┴────────────────────────────┴────────────┘

• Deploy vLLM FP16 for production serving.
• vLLM is 241.5% faster than HF FP16 with negligible quality difference (PPL delta 0.01),
  using 5390 MB more VRAM for its KV cache pool. For memory-constrained or single-user
  setups, HF INT4 (NF4) is the best fallback (saves 4963 MB vs FP16, perplexity +1.70 PPL).
```

---

## Installation

```bash
# HF Transformers only
pip install litmus-lab

# HF + vLLM backend
pip install "litmus-lab[vllm]"

# HF + AI-powered recommendations (Groq)
pip install "litmus-lab[ai]"

# Everything
pip install "litmus-lab[all]"
```

> vLLM requires Linux or WSL2. It does not run on Windows natively.

---

## Usage

```bash
litmus-lab inference \
  --model microsoft/Phi-3-mini-4k-instruct \
  --prompt "Explain the transformer architecture" \
  --backend hf
```

### Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--model` | HuggingFace model repo ID | required |
| `--prompt` | Input prompt for generation | required |
| `--token` | HuggingFace token for gated models | `None` |
| `--backend` | `hf` / `vllm` / `all` | `hf` |

### Backend modes

| Mode | What runs |
|------|-----------|
| `hf` | HF Transformers — FP16, INT8, INT4 (NF4) |
| `vllm` | vLLM — FP16 only |
| `all` | All four passes in sequence |

### Examples

```bash
# HF only — compare quantization formats
litmus-lab inference \
  --model Qwen/Qwen2.5-7B-Instruct \
  --prompt "Explain quantum gravity" \
  --backend hf

# vLLM only
litmus-lab inference \
  --model mistralai/Mistral-7B-Instruct-v0.3 \
  --prompt "Write a Linux shell script" \
  --backend vllm

# Full comparison — HF + vLLM
litmus-lab inference \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --token hf_xxxxxxx \
  --prompt "Explain TCP congestion control" \
  --backend all
```

---

## AI Recommendations

Set a [Groq](https://console.groq.com) API key (free tier) to get an AI-powered recommendation from `llama-3.3-70b-versatile` instead of the built-in heuristic:

```bash
export GROQ_API_KEY=gsk_...
```

No extra flags needed. If the key is missing, the rate limit is hit, or there is no internet, the tool silently falls back to the offline engine.

---

## Metrics

| Metric | What it measures |
|--------|-----------------|
| **VRAM (MB)** | Peak GPU memory consumed — model weights + KV cache |
| **TPS** | Tokens generated per second — throughput |
| **TTFT** | Time to first token — generation latency |
| **Perplexity** | Language quality on WikiText-2. Lower is better. Delta >2.0 vs FP16 signals degradation |

---

## Supported models

### HF backend (FP16 / INT8 / INT4)

Any HuggingFace **causal language model** that loads via `AutoModelForCausalLM`:

- **Meta** — Llama 3, 3.1, 3.2, 3.3
- **Mistral AI** — Mistral 7B, Mixtral 8x7B
- **Microsoft** — Phi-3, Phi-3.5, Phi-4
- **Google** — Gemma, Gemma 2
- **Alibaba** — Qwen2, Qwen2.5
- **DeepSeek** — DeepSeek-R1, DeepSeek-V2
- **Falcon, Yi, BLOOM**, and most community fine-tunes

Gated models (Llama, Gemma) require `--token`.

### vLLM backend (FP16)

Same model coverage as HF. vLLM runs FP16 only — VRAM usage will be higher than HF FP16 but throughput is significantly better.

---

## What is NOT supported

- BERT, RoBERTa, and other masked language models
- T5, BART, mT5, and other sequence-to-sequence models
- AWQ / GPTQ quantization on the vLLM backend
- Models that exceed your GPU VRAM at FP16
- vLLM on Windows (use Linux or WSL2)
- Multi-GPU / tensor parallel setups

---

## Requirements

- Python 3.10+
- CUDA-capable GPU (CPU works but is very slow)
- CUDA 11.8+ / 12.x

---

## License

MIT
