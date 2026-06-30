import gc
import os
import time

import psutil
import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


def hf_bench(model: str, prompt: str, token: str, quantization: str = None) -> dict:
    """
    quantization: None = native FP16, "int8", "int4"
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"

    bnb_config = None
    if quantization == "int8":
        bnb_config = BitsAndBytesConfig(load_in_8bit=True)
    elif quantization == "int4":
        bnb_config = BitsAndBytesConfig(load_in_4bit=True)

    model_hf = AutoModelForCausalLM.from_pretrained(
        model, quantization_config=bnb_config, device_map="auto", token=token
    )
    tokenizer = AutoTokenizer.from_pretrained(model, token=token)

    inputs = tokenizer(prompt, return_tensors="pt")
    prompt_len = inputs.input_ids.shape[1]
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # warmup
    with torch.no_grad():
        _ = model_hf(**inputs)
    torch.cuda.synchronize()

    # TTFT
    start = time.perf_counter()
    with torch.no_grad():
        _ = model_hf(**inputs)
    torch.cuda.synchronize()
    ttft = time.perf_counter() - start

    # TPS
    start_tps = time.perf_counter()
    with torch.no_grad():
        gen_outputs = model_hf.generate(
            **inputs, max_new_tokens=50, min_new_tokens=50,
            do_sample=False, repetition_penalty=1.2, use_cache=True
        )
    torch.cuda.synchronize()
    tps = (gen_outputs[0].shape[0] - prompt_len) / (time.perf_counter() - start_tps)

    # VRAM / RAM
    if torch.cuda.is_available():
        mem_mb = torch.cuda.memory_allocated() / (1024 ** 2)
    else:
        mem_mb = psutil.Process(os.getpid()).memory_info().rss / (1024 ** 2)

    # Perplexity on WikiText-2
    test_data = load_dataset("Salesforce/wikitext", "wikitext-2-raw-v1", split="test")
    full_text = "\n\n".join([line.strip() for line in test_data["text"] if line.strip()])
    test_data.cleanup_cache_files()
    del test_data
    gc.collect()

    max_len = getattr(model_hf.config, "max_position_embeddings", 2048)
    # Cap at 512 — enough for stable PPL comparison, prevents OOM on large-context models
    # (e.g. Qwen2.5 has 131072 max_position_embeddings which would OOM a 15GB GPU at FP16)
    max_safe_len = min(max_len, 512)

    ref_inputs = tokenizer(full_text, return_tensors="pt", max_length=max_safe_len, truncation=True)
    cuda_tokens = ref_inputs["input_ids"].to(device)

    with torch.no_grad():
        loss_out = model_hf(cuda_tokens, labels=cuda_tokens)
        perplexity = torch.exp(loss_out.loss).item()

    del model_hf, loss_out, ref_inputs, cuda_tokens, tokenizer, full_text, gen_outputs, inputs
    torch.cuda.synchronize()
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()
    gc.collect()

    return {"ttft": ttft, "mem": mem_mb, "tps": tps, "perplexity": perplexity}
