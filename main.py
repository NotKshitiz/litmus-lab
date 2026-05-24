import typer
from typing import Annotated
import torch
import warnings
import os 
import time
import gc
import psutil
import datasets

from int_4 import int4_quant
from int_8 import int8_quant
from transformers import AutoTokenizer, AutoModelForCausalLM, logging
from transformers.utils.logging import disable_progress_bar
from datasets import load_dataset
from rich.console import Console
from rich.table import Table

# Initialize Rich Console
console = Console()

# Suppress annoying logging clutter
warnings.filterwarnings("ignore")
datasets.logging.set_verbosity_error()
datasets.disable_progress_bars()
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import logging as python_logging
python_logging.getLogger("huggingface_hub").setLevel(python_logging.ERROR)
logging.set_verbosity_error()
disable_progress_bar()

app = typer.Typer()

def generate_heuristic_recommendation(native, int8, int4, model_name):
    """
    Analyzes model metrics locally using deterministic rule thresholds.
    Requires no internet, no keys, and won't hallucinate.
    """
    analysis = f"\n[bold underline cyan]SYSTEM EVALUATION REPORT FOR {model_name}:[/bold underline cyan]\n"
    
    # Calculate key differences
    vram_saved_int8 = native['mem'] - int8['mem']
    vram_saved_int4 = native['mem'] - int4['mem']
    
    speed_drop_int8_pct = ((native['tps'] - int8['tps']) / native['tps']) * 100
    speed_drop_int4_pct = ((native['tps'] - int4['tps']) / native['tps']) * 100
    
    ppl_growth_int8 = int8['perplexity'] - native['perplexity']
    ppl_growth_int4 = int4['perplexity'] - native['perplexity']
    
    # Case 1: Model is trivial in size (e.g., OPT-125m) - Don't quantize
    if native['mem'] < 1000:
        return analysis + (
            f"• [green]Recommendation: Deploy NATIVE (FP16).[/green]\n"
            f"• Reason: The baseline VRAM footprint is exceptionally small ({native['mem']:.1f} MB). "
            f"Quantization degrades token processing speed (TPS) by "
            f"{speed_drop_int4_pct:.1f}% without giving you any meaningful structural memory gains."
        )

    # Case 2: Extreme 4-bit quantization breakdown (Scrambled weights check)
    if ppl_growth_int4 > 2.0:
        return analysis + (
            f"• [yellow]Recommendation: Deploy INT8 Quantization.[/yellow]\n"
            f"• Reason: Moving to INT4 causes a severe degradation in accuracy performance metrics "
            f"(Perplexity jumped by +{ppl_growth_int4:.2f}). INT8 balances safety and footprint limits, "
            f"saving you {vram_saved_int8:.2f} MB of VRAM while keeping language generation completely stable (+{ppl_growth_int8:.2f} PPL)."
        )
        
    # Case 3: If INT4 speeds are actually better or neck-and-neck with INT8 while saving more memory
    if int4['tps'] >= int8['tps'] or (speed_drop_int4_pct - speed_drop_int8_pct) < 15:
        return analysis + (
            f"• [green]Recommendation: Deploy INT4 (NF4 format).[/green]\n"
            f"• Reason: Reclaims a significant [bold]{vram_saved_int4:.2f} MB[/bold] of critical GPU VRAM overhead "
            f"compared to Native FP16 execution. The language model perplexity delta holds together tightly (+{ppl_growth_int4:.2f} PPL) "
            f"making it the most hardware-efficient choice for this architecture size."
        )

    # Case 4: Default Fallback - INT8 is faster but heavier than INT4
    return analysis + (
        f"• [yellow]Recommendation: Conditional Deployment (INT8 for Speed / INT4 for VRAM).[/yellow]\n"
        f"• Reason: INT4 saves the most memory ({vram_saved_int4:.2f} MB), but hits a heavy speed tax "
        f"running at {int4['tps']:.1f} TPS ({speed_drop_int4_pct:.1f}% drop). Choose INT8 if low-latency user response "
        f"is critical, or INT4 if you are running tight on hardware memory boundaries."
    )

@app.command()
def inference(
    model: Annotated[str, typer.Option(help="Model name")],
    prompt: Annotated[str, typer.Option(help="Input prompt: e.g. 'What is the capital of France?'")],
    token: Annotated[str, typer.Option(help="Hugging face token")] = None
):
    token_id = token
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Running inference with model: {model} on device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(model, token=token_id)
    model_native = AutoModelForCausalLM.from_pretrained(model, device_map="auto", token=token_id)
    input_text = prompt

    inputs = tokenizer(input_text, return_tensors="pt")
    prompt_len = inputs.input_ids.shape[1]
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    print("Running Warmup..")
    with torch.no_grad():
        _ = model_native(**inputs)
    torch.cuda.synchronize()
    
    start = time.time()
    with torch.no_grad():
        outputs = model_native(**inputs)
    torch.cuda.synchronize()
    end = time.time()
    ttft = end - start
    
    start_TPS = time.time()
    with torch.no_grad():
        gen_outputs = model_native.generate(**inputs, max_new_tokens=50, min_new_tokens=50, do_sample=False, repetition_penalty=1.2, use_cache=True)
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
        
    test_data = load_dataset("Salesforce/wikitext", "wikitext-2-raw-v1", split="test")
    full_text_sample = "\n\n".join([line.strip() for line in test_data["text"] if line.strip()])
    test_data.cleanup_cache_files()
    del test_data
    gc.collect()
    
    max_model_limit = getattr(model_native.config, "max_position_embeddings", 2048)
    max_safe_len = min(max_model_limit, 2048) if "opt" in model.lower() else max_model_limit
    
    ref_inputs = tokenizer(full_text_sample, return_tensors="pt", max_length=max_safe_len, truncation=True)
    cuda_tokens_native = ref_inputs["input_ids"].to(device)
    
    with torch.no_grad():
        outputs_native = model_native(cuda_tokens_native, labels=cuda_tokens_native)
        perplexity_native = torch.exp(outputs_native.loss).item()
        
    # Store metrics for analyzer tracking
    native_metrics = {"mem": mem_mb, "tps": tps, "ttft": ttft, "perplexity": perplexity_native}
    
    table = Table("Quantization", f"{mem_label}", "Tokens/sec(TPS)", "Time to first token(TTFT)", "Perplexity")
    table.add_row("Native", f"{native_metrics['mem']:.2f}", f"{native_metrics['tps']:.4f}", f"{native_metrics['ttft']:.4f} sec", f"{native_metrics['perplexity']:.2f}")
    
    # Drop native allocations completely out of VRAM scope
    del model_native
    del outputs_native
    del ref_inputs
    del cuda_tokens_native
    del tokenizer
    del full_text_sample
    del gen_outputs
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()
    
    # Run the isolated INT8 track module
    res_int8 = int8_quant(model, prompt, token)
    table.add_row("INT8", f"{res_int8['mem']:.2f}", f"{res_int8['tps']:.4f}", f"{res_int8['ttft']:.4f} sec", f"{res_int8['perplexity']:.2f}")
    
    # Run the isolated INT4 track module
    res_int4 = int4_quant(model, prompt, token)
    table.add_row("INT4", f"{res_int4['mem']:.2f}", f"{res_int4['tps']:.4f}", f"{res_int4['ttft']:.4f} sec", f"{res_int4['perplexity']:.2f}")
    
    # Print clean dashboard performance table
    console.print(table)
    
    # Generate local report
    report = generate_heuristic_recommendation(native_metrics, res_int8, res_int4, model)
        
    print("\n" + "="*90)
    console.print(report)
    print("="*90 + "\n")

if __name__ == "__main__":
    app()