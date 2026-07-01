from setuptools import setup, find_packages

with open("readme.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="litmus-lab",
    version="0.3.5",
    description="A CLI benchmarking framework for LLM inference across FP16/INT8/INT4/HQQ/Quanto/AWQ/GPTQ quantization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    py_modules=["main"],
    packages=find_packages(exclude=["venv*", "dist*", "build*", "*.egg-info*"]),
    include_package_data=True,
    install_requires=[
        "typer>=0.9.0",
        "rich>=13.0.0",
        "bitsandbytes>=0.42.0",
        "transformers>=4.40.0",
        "datasets>=2.19.0",
        "psutil>=5.9.0",
        "accelerate>=0.30.0",
        "torch",
        "hqq>=0.2.1",
        "optimum-quanto>=0.2.0",
    ],
    extras_require={
        # vLLM and groq install cleanly everywhere they're supported (vLLM ships
        # real wheels; groq is pure Python) — these are the only two bundled into
        # `all`, so `pip install litmus-lab[all]` is guaranteed to leave you with a
        # working `litmus-lab` command.
        #
        # AWQ/GPTQ are deliberately NOT in `all`. transformers' quantizers require
        # `gptqmodel` (+ `optimum` for GPTQ) rather than the legacy `autoawq`/
        # `auto-gptq` packages, but gptqmodel is still source-only on PyPI (no
        # prebuilt wheels) and can fail to compile depending on the machine's CUDA
        # toolchain. A failed extra install must never take down the base CLI, so
        # AWQ/GPTQ stay a separate, explicit opt-in: `pip install litmus-lab[awq,gptq]`.
        "vllm": ["vllm>=0.4.0"],
        "ai":   ["groq>=0.9.0"],
        "awq":  ["gptqmodel>=1.0.0"],
        "gptq": ["optimum>=1.20.0", "gptqmodel>=1.0.0"],
        "all":  ["vllm>=0.4.0", "groq>=0.9.0"],
    },
    entry_points={
        "console_scripts": [
            "litmus-lab=main:app",
        ],
    },
)
