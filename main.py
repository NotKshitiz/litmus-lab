import typer
from typing import Annotated
import torch
import warnings

from int_4 import int4_quant
warnings.filterwarnings("ignore")
from transformers import AutoTokenizer, AutoModelForCausalLM, logging,BitsAndBytesConfig
from transformers.utils.logging import disable_progress_bar
import os 
from rich.console import Console
from rich.table import Table
import psutil
import datasets
from int_8 import int8_quant
from datasets import load_dataset
console = Console()
datasets.logging.set_verbosity_error()
datasets.disable_progress_bars()
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
import logging as python_logging
python_logging.getLogger("huggingface_hub").setLevel(python_logging.ERROR)
logging.set_verbosity_error()
disable_progress_bar()
app = typer.Typer()
import time
@app.command()
def inference(model: Annotated[str, typer.Option(help="Model name")],prompt: Annotated[str, typer.Option(help="Input prompt: e.g. 'What is the capital of France?'")],token: Annotated[str, typer.Option(help="Hugging face token")]=None):
    token_id = token
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Running inference with model: {model} on device: {device}")
    tokenizer = AutoTokenizer.from_pretrained(model,token=token_id)
    model_native = AutoModelForCausalLM.from_pretrained(model,device_map="auto",token=token_id)
    input_text = prompt

    inputs = tokenizer(input_text,return_tensors="pt")
    prompt_len = inputs.input_ids.shape[1]
    inputs = {k: v.to(device) for k, v in inputs.items()}
    print("Running Warmup..")
    with torch.no_grad():
        _= model_native(**inputs)
    torch.cuda.synchronize()
    start = time.time()
    with torch.no_grad():
        outputs = model_native(**inputs)
    torch.cuda.synchronize()
    end = time.time()
    ttft = end - start
    torch.cuda.synchronize()
    start_TPS = time.time()
    with torch.no_grad():
        gen_outputs = model_native.generate(**inputs, max_new_tokens=50,min_new_tokens=50,do_sample=False,repetition_penalty=1.2,use_cache=True)
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
    import gc 
    gc.collect()
    max_model_limit = getattr(model_native.config, "max_position_embeddings", 2048)
    max_safe_len = min(max_model_limit, 2048) if "opt" in model.lower() else max_model_limit
    ref_inputs = tokenizer(
        full_text_sample, return_tensors="pt", max_length=max_safe_len, truncation=True
    )
    cuda_tokens_native = ref_inputs["input_ids"].to(device)
    with torch.no_grad():
        # One raw forward matrix calculation pass—instant execution
        outputs_native = model_native(
            cuda_tokens_native, labels=cuda_tokens_native
        )
        perplexity_native = torch.exp(outputs_native.loss).item()
    table = Table("Quantization",f"{mem_label}","Tokens/sec(TPS)","Time to first token(TTFT)","Perplexity")
    table.add_row("Native",f"{mem_mb:.2f}",f"{tps:.4f}",f"{ttft:.4f} sec",f"{perplexity_native:.2f}")
    del model_native
    del outputs_native
    del ref_inputs
    del cuda_tokens_native
    del tokenizer
    del full_text_sample
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()
    
    res_int8 = int8_quant(model,prompt,token)
    table.add_row("INT8", f"{res_int8['mem']:.2f}", f"{res_int8['tps']:.4f}", f"{res_int8['ttft']:.4f} sec", f"{res_int8['perplexity']:.2f}")
    res_int4 = int4_quant(model,prompt,token)
    table.add_row("INT4", f"{res_int4['mem']:.2f}", f"{res_int4['tps']:.4f}", f"{res_int4['ttft']:.4f} sec", f"{res_int4['perplexity']:.2f}")
    console.print(table)

if __name__ == "__main__":
    app()