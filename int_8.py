import time
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from datasets import load_dataset
import os 
import psutil
import gc
def int8_quant(model:str,prompt:str,token:str):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    token_id = token
    bnb_config = BitsAndBytesConfig(
        load_in_8bit=True
    )
    model_int8 = AutoModelForCausalLM.from_pretrained(model,quantization_config=bnb_config,
    device_map="auto",token=token_id
    )
    input_text = prompt

    inputs = tokenizer(input_text,return_tensors="pt")
    prompt_len = inputs.input_ids.shape[1]
    inputs = {k: v.to(device) for k, v in inputs.items()}
    tokenizer = AutoTokenizer.from_pretrained(model, token=token_id)
    with torch.no_grad():
        _ = model_int8(**inputs)
    torch.cuda.synchronize()
    start = time.time()
    with torch.no_grad():
        outputs = model_int8(**inputs)
    torch.cuda.synchronize()
    end = time.time()
    ttft = end - start
    torch.cuda.synchronize()
    start_TPS = time.time()
    with torch.no_grad():
        gen_outputs = model_int8.generate(**inputs, max_new_tokens=50,min_new_tokens=50,do_sample=True,repetition_penalty=1.2,use_cache=True)
    torch.cuda.synchronize()
    end_TPS = time.time()
    total_gen_time = end_TPS - start_TPS
    total_tokens = gen_outputs[0].shape[0]
    actual_new_tokens = total_tokens - prompt_len
    tps = actual_new_tokens / total_gen_time
    if torch.cuda.is_available():
        mem_mb = torch.cuda.memory_allocated() / (1024**2)
        mem_label = "VRAM (MB)"
    else:
        process = psutil.Process(os.getpid())
        mem_mb = process.memory_info().rss / (1024**2)
        mem_label = "RAM (MB)"
    test_data = load_dataset(
        "Salesforce/wikitext", "wikitext-2-raw-v1", split="test"
    )
    full_text_sample = "\n\n".join(
        [line.strip() for line in test_data["text"] if line.strip()]
    )
    test_data.cleanup_cache_files()
    del test_data
    gc.collect()
    ref_inputs = tokenizer(
        full_text_sample, return_tensors="pt", max_length=3000, truncation=True
    )
    cuda_tokens_int8 = ref_inputs["input_ids"].to(device)
    with torch.no_grad():
        # One raw forward matrix calculation pass—instant execution
        outputs_int8 = model_int8(
            cuda_tokens_int8, labels=cuda_tokens_int8
        )
        perplexity_int8 = torch.exp(outputs_int8.loss).item()
    del outputs_int8
    del ref_inputs
    del cuda_tokens_int8
    del tokenizer
    del full_text_sample
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()
    del model_int8
    del gen_outputs
    gc.collect()
    torch.cuda.empty_cache()
    return {
        "ttft":ttft,
        "mem":mem_mb,
        "tps":tps,
        "perplexity":perplexity_int8
    }
    