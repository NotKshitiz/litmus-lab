import gc
import os
import time

import psutil
import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


def _build_quant_config(quantization: str):
    """Builds the transformers quantization_config for a given mode.

    "awq"/"gptq" return None deliberately — those checkpoints declare their own
    quantization_config in config.json, so passing one here would conflict with it.
    """
    if quantization in (None, "awq", "gptq"):
        return None
    if quantization == "int8":
        return BitsAndBytesConfig(load_in_8bit=True)
    if quantization == "nf4":
        return BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")
    if quantization == "fp4":
        return BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="fp4")
    if quantization == "nf4_double":
        return BitsAndBytesConfig(
            load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True
        )
    if quantization == "hqq":
        from transformers import HqqConfig
        return HqqConfig(nbits=4, group_size=64)
    if quantization == "quanto_int8":
        from transformers import QuantoConfig
        return QuantoConfig(weights="int8")
    if quantization == "quanto_int4":
        from transformers import QuantoConfig
        return QuantoConfig(weights="int4")
    raise ValueError(f"Unknown quantization mode: {quantization!r}")


def hf_bench(model: str, prompt: str, token: str, quantization: str = None) -> dict:
    """
    quantization: None = native FP16, "int8", "nf4", "fp4", "nf4_double", "hqq",
                  "quanto_int8", "quanto_int4" (all on-the-fly), or "awq" / "gptq"
                  (require `model` to already be a pre-quantized checkpoint, e.g.
                  TheBloke/Mistral-7B-v0.1-AWQ — install autoawq / auto-gptq respectively)
    """

    device = "cuda" if torch.cuda.is_available() else "cpu"

    quant_config = _build_quant_config(quantization)

    model_hf = AutoModelForCausalLM.from_pretrained(
        model, quantization_config=quant_config, device_map="auto", token=token
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

    del model_hf, loss_out, ref_inputs, cuda_tokens, tokenizer, full_text, gen_outputs
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()

    return {"ttft": ttft, "mem": mem_mb, "tps": tps, "perplexity": perplexity}
