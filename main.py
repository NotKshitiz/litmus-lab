import os
import warnings
from typing import Annotated

import datasets
import torch
import typer
from rich.console import Console
from rich.table import Table
from transformers import logging
from transformers.utils.logging import disable_progress_bar

from backends.hf import hf_bench

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
console = Console()


def get_ai_recommendation(results: dict, model_name: str, api_key: str) -> str | None:
    try:
        from groq import Groq
    except ImportError:
        console.print(
            "[yellow]groq package not installed — falling back to offline recommendation. "
            "Install with: pip install litmus-lab[ai][/yellow]"
        )
        return None

    lines = [
        "You are an LLM deployment advisor. Analyze these benchmark results and give a concise deployment recommendation.",
        "",
        f"Model: {model_name}",
        "",
        "Benchmark Results:",
    ]
    for key, label in [
        ("hf_fp16",   "HF FP16      "),
        ("hf_int8",   "HF INT8      "),
        ("hf_int4",   "HF INT4 (NF4)"),
        ("vllm_fp16", "vLLM FP16    "),
    ]:
        if key in results:
            m = results[key]
            lines.append(
                f"  {label}: VRAM={m['mem']:.0f}MB  TPS={m['tps']:.2f}  "
                f"TTFT={m['ttft']:.4f}s  Perplexity={m['perplexity']:.2f}"
            )
    lines += [
        "",
        "Metrics:",
        "  VRAM (MB)   — GPU memory usage. Lower is more hardware-efficient.",
        "  TPS         — Tokens per second. Higher is faster throughput.",
        "  TTFT        — Time to first token. Lower is less latency.",
        "  Perplexity  — Language quality. Lower is better; delta >2.0 from FP16 indicates degradation.",
        "",
        "Give a 3-4 sentence deployment recommendation covering: best precision/backend choice, "
        "key trade-offs, and when to choose each option.",
    ]

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "\n".join(lines)}],
            max_tokens=400,
            temperature=0.3,
        )
        text = response.choices[0].message.content.strip()
        return (
            f"\n[bold underline green]AI RECOMMENDATION "
            f"(Groq · llama-3.3-70b-versatile)[/bold underline green]\n{text}"
        )
    except Exception as e:
        console.print(
            f"[yellow]Groq API failed ({type(e).__name__}) — falling back to offline recommendation.[/yellow]"
        )
        return None


def generate_offline_recommendation(results: dict, model_name: str) -> str:
    header = f"\n[bold underline cyan]RECOMMENDATION — {model_name}[/bold underline cyan]\n"

    native = results.get("hf_fp16")
    int8   = results.get("hf_int8")
    int4   = results.get("hf_int4")
    vllm   = results.get("vllm_fp16")

    has_hf = native and int8 and int4

    # ── pick best HF quantization ──────────────────────────────────
    hf_pick = hf_reason = None
    if has_hf:
        vram_saved_int8    = native["mem"] - int8["mem"]
        vram_saved_int4    = native["mem"] - int4["mem"]
        speed_drop_int4_pct = ((native["tps"] - int4["tps"]) / native["tps"]) * 100
        speed_drop_int8_pct = ((native["tps"] - int8["tps"]) / native["tps"]) * 100
        ppl_growth_int8    = int8["perplexity"] - native["perplexity"]
        ppl_growth_int4    = int4["perplexity"] - native["perplexity"]

        if native["mem"] < 1000:
            hf_pick   = "FP16"
            hf_reason = f"baseline VRAM is tiny ({native['mem']:.0f} MB), quantization has no benefit"
        elif ppl_growth_int4 > 2.0:
            hf_pick   = "INT8"
            hf_reason = (
                f"INT4 degrades quality too much (+{ppl_growth_int4:.2f} PPL); "
                f"INT8 saves {vram_saved_int8:.0f} MB with stable quality (+{ppl_growth_int8:.2f} PPL)"
            )
        elif int4["tps"] >= int8["tps"] or (speed_drop_int4_pct - speed_drop_int8_pct) < 15:
            hf_pick   = "INT4 (NF4)"
            hf_reason = f"saves {vram_saved_int4:.0f} MB vs FP16, perplexity stays tight (+{ppl_growth_int4:.2f} PPL)"
        else:
            hf_pick   = "INT8"
            hf_reason = f"INT4 costs {speed_drop_int4_pct:.1f}% TPS for only {vram_saved_int4:.0f} MB extra savings"

    # ── factor in vLLM if available ────────────────────────────────
    if vllm and native:
        tps_delta_pct  = ((vllm["tps"] - native["tps"]) / native["tps"]) * 100
        vram_delta     = vllm["mem"] - native["mem"]
        ppl_delta      = abs(vllm["perplexity"] - native["perplexity"])
        vram_direction = "more" if vram_delta > 0 else "less"

        if tps_delta_pct >= 30:
            verdict = "[green]Deploy vLLM FP16 for production serving.[/green]"
            reason  = (
                f"vLLM is {tps_delta_pct:.1f}% faster than HF FP16 with negligible quality difference "
                f"(PPL delta {ppl_delta:.2f}), using {abs(vram_delta):.0f} MB {vram_direction} VRAM for its KV cache pool."
            )
            if hf_pick:
                reason += (
                    f" For memory-constrained or single-user setups, "
                    f"HF {hf_pick} is the best fallback ({hf_reason})."
                )
        else:
            if hf_pick:
                verdict = f"[green]Deploy HF {hf_pick}.[/green]"
                reason  = (
                    f"vLLM offers only {tps_delta_pct:.1f}% throughput gain — not worth the extra VRAM overhead. "
                    f"Among HF options, {hf_pick} is optimal: {hf_reason}."
                )
            else:
                verdict = "[yellow]Deploy HF FP16.[/yellow]"
                reason  = f"vLLM offers only {tps_delta_pct:.1f}% throughput gain, not worth the overhead."
    elif has_hf:
        color   = "green" if hf_pick in ("FP16", "INT4 (NF4)") else "yellow"
        verdict = f"[{color}]Deploy HF {hf_pick}.[/{color}]"
        reason  = hf_reason.capitalize() + "."
    else:
        return header + "• [yellow]Not enough data for a recommendation.[/yellow]"

    return header + f"• {verdict}\n• {reason}"


@app.command()
def inference(
    model: Annotated[str, typer.Option(help="HuggingFace model repo")],
    prompt: Annotated[str, typer.Option(help="Input prompt")],
    token: Annotated[str, typer.Option(help="HuggingFace token for gated models")] = None,
    backend: Annotated[str, typer.Option(help="Backend to benchmark: hf | vllm | all")] = "hf",
):
    if backend not in ("hf", "vllm", "all"):
        console.print("[red]--backend must be one of: hf, vllm, all[/red]")
        raise typer.Exit(1)

    run_hf = backend in ("hf", "all")
    run_vllm = backend in ("vllm", "all")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    mem_label = "VRAM (MB)" if torch.cuda.is_available() else "RAM (MB)"
    console.print(f"[bold]Model:[/bold] {model}  |  [bold]Device:[/bold] {device}  |  [bold]Backend:[/bold] {backend}\n")

    results = {}

    if run_hf:
        for key, quantization, label in [
            ("hf_fp16", None,   "HF · FP16      "),
            ("hf_int8", "int8", "HF · INT8      "),
            ("hf_int4", "int4", "HF · INT4 (NF4)"),
        ]:
            console.print(f"[cyan]Benchmarking {label.strip()}...[/cyan]")
            results[key] = hf_bench(model, prompt, token, quantization=quantization)

    if run_vllm:
        console.print("[magenta]Benchmarking vLLM · FP16...[/magenta]")
        try:
            from backends.vllm import vllm_bench
            results["vllm_fp16"] = vllm_bench(model, prompt, token, quantization=None)
        except ImportError:
            console.print(
                "[red]vLLM is not installed — skipping. "
                "Install with: pip install litmus-lab\\[vllm][/red]\n"
                "[dim]Note: vLLM requires Linux or WSL2.[/dim]"
            )
            if not run_hf:
                raise typer.Exit(1)

    # ── Results table ──────────────────────────────────────────────
    table = Table("Mode", mem_label, "Tokens/sec (TPS)", "Time to First Token (TTFT)", "Perplexity")

    for key, label in [
        ("hf_fp16",   "HF · FP16      "),
        ("hf_int8",   "HF · INT8      "),
        ("hf_int4",   "HF · INT4 (NF4)"),
        ("vllm_fp16", "vLLM · FP16    "),
    ]:
        if key not in results:
            continue
        m = results[key]
        table.add_row(
            label,
            f"{m['mem']:.2f}",
            f"{m['tps']:.4f}",
            f"{m['ttft']:.4f} sec",
            f"{m['perplexity']:.2f}",
        )

    console.print(table)

    # ── Recommendation ─────────────────────────────────────────────
    has_hf_all = all(k in results for k in ("hf_fp16", "hf_int8", "hf_int4"))
    api_key = os.environ.get("GROQ_API_KEY")

    if api_key and has_hf_all:
        ai_report = get_ai_recommendation(results, model, api_key)
        if ai_report:
            print("\n" + "=" * 90)
            console.print(ai_report)
            print("=" * 90)
            print()
            raise typer.Exit(0)

    # offline fallback (also used when GROQ_API_KEY is not set)
    report = generate_offline_recommendation(results, model)
    print("\n" + "=" * 90)
    console.print(report)
    print("=" * 90)

    print()


if __name__ == "__main__":
    app()
