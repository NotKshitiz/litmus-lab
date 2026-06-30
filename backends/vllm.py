import gc
import os
import time

import psutil
import torch


def vllm_bench(model: str, prompt: str, token: str, quantization: str = None) -> dict:
    """
    quantization: None = native FP16, "awq", "gptq", "fp8"

    Requires: pip install vllm
    Note: AWQ/GPTQ require pre-quantized model checkpoints on HuggingFace
          (e.g. TheBloke/Mistral-7B-v0.1-AWQ), not the base model repo.
    """
    try:
        from vllm import LLM, SamplingParams
    except ImportError:
        raise ImportError("vLLM is not installed. Run: pip install vllm")

    os.environ["HF_TOKEN"] = token or ""

    # Snapshot free VRAM before vLLM loads — we compute usage as the delta.
    # torch.cuda.mem_get_info() queries the CUDA driver directly and sees all
    # allocators including vLLM's custom pool, unlike memory_reserved() which
    # only tracks PyTorch-managed memory.
    if torch.cuda.is_available():
        free_before, total_mem = torch.cuda.mem_get_info()
        gpu_memory_utilization = min(0.92, (free_before - 400 * 1024 * 1024) / total_mem)
    else:
        free_before = 0
        total_mem = 0
        gpu_memory_utilization = 0.92

    llm = LLM(
        model=model,
        quantization=quantization,
        dtype="float16",
        trust_remote_code=True,
        gpu_memory_utilization=gpu_memory_utilization,
    )

    sampling_params = SamplingParams(
        max_tokens=50,
        min_tokens=50,
        temperature=0,
        repetition_penalty=1.2,
        prompt_logprobs=1,
    )

    # warmup
    llm.generate([prompt], sampling_params)

    # TTFT + TPS
    start = time.perf_counter()
    outputs = llm.generate([prompt], sampling_params)
    elapsed = time.perf_counter() - start

    output_tokens = outputs[0].outputs[0].token_ids
    tps = len(output_tokens) / elapsed
    ttft = elapsed  # approximation until AsyncEngine streaming is wired up

    # VRAM: delta between free memory before load and free memory now.
    # Captures model weights + KV cache pool regardless of which allocator vLLM used.
    if torch.cuda.is_available():
        free_after, _ = torch.cuda.mem_get_info()
        mem_mb = (free_before - free_after) / (1024 ** 2)
    else:
        mem_mb = psutil.Process(os.getpid()).memory_info().rss / (1024 ** 2)

    # Perplexity from prompt_logprobs on WikiText-2 sample
    perplexity = _compute_perplexity(llm, model)

    del llm
    gc.collect()
    torch.cuda.empty_cache()

    return {"ttft": ttft, "mem": mem_mb, "tps": tps, "perplexity": perplexity}


def _compute_perplexity(llm, model_name: str) -> float:
    from datasets import load_dataset
    from transformers import AutoTokenizer

    test_data = load_dataset("Salesforce/wikitext", "wikitext-2-raw-v1", split="test")
    full_text = "\n\n".join([line.strip() for line in test_data["text"] if line.strip()])
    test_data.cleanup_cache_files()
    del test_data

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokens = tokenizer(full_text, return_tensors="pt", max_length=512, truncation=True)
    token_ids = tokens["input_ids"][0].tolist()
    text_chunk = tokenizer.decode(token_ids)
    del tokenizer, tokens

    from vllm import SamplingParams
    params = SamplingParams(max_tokens=1, prompt_logprobs=1, temperature=0)
    result = llm.generate([text_chunk], params)

    prompt_logprobs = result[0].prompt_logprobs or []
    log_probs = [
        list(token_logprob.values())[0].logprob
        for token_logprob in prompt_logprobs
        if token_logprob
    ]

    if not log_probs:
        return float("nan")

    import math
    avg_nll = -sum(log_probs) / len(log_probs)
    return math.exp(avg_nll)
