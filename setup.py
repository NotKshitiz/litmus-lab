from setuptools import setup, find_packages

with open("readme.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="litmus-lab",
    version="0.3.2",
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
        # vLLM only runs on Linux/WSL2 — a hard dependency would break `pip install`
        # on Windows/Mac. autoawq/auto-gptq ship version-pinned CUDA kernels that
        # frequently fail to build on machines that don't match exactly — a hard
        # dependency would risk breaking install for CPU-only/non-matching users
        # even for plain FP16 benchmarking. All three stay opt-in.
        "vllm": ["vllm>=0.4.0"],
        "ai":   ["groq>=0.9.0"],
        "awq":  ["autoawq>=0.2.0"],
        "gptq": ["auto-gptq>=0.7.0"],
        "all":  ["vllm>=0.4.0", "groq>=0.9.0", "autoawq>=0.2.0", "auto-gptq>=0.7.0"],
    },
    entry_points={
        "console_scripts": [
            "litmus-lab=main:app",
        ],
    },
)
