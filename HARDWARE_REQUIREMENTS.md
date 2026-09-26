# HARDWARE REQUIREMENTS & GPU MANAGER SPECIFICATION

## 1. Hardware Tiers & Capabilities

### Tier 1: Entry / Dev Workstation (8 GB VRAM)
- **Target**: NVIDIA RTX 3060 / 4060 (8GB VRAM), 16GB RAM
- **Mode**: Local LLM (Llama 3 8B Q4), Blender EEVEE Fast Render, 720p/1080p 30FPS output.

### Tier 2: Production Workstation (16–24 GB VRAM)
- **Target**: NVIDIA RTX 3090 / 4090 / A4000 (16-24GB VRAM), 32GB RAM
- **Mode**: Full 13-Model Ecosystem, Blender Cycles Raytracing, 4K 60FPS output, LoRA Fine-Tuning.

### Tier 3: AI Training Cluster (48+ GB VRAM)
- **Target**: NVIDIA A100 / H100 or Multi-GPU RTX 4090
- **Mode**: Large-scale synthetic data generation & Foundation Model Fine-Tuning.

## 2. Dynamic GPU Allocation Strategy
- `GPUManager.java` inspects VRAM via `nvidia-smi` / PyTorch CUDA API.
- Automatically selects render engine (EEVEE for low VRAM, Cycles for high VRAM) and batch size to prevent Out-Of-Memory (OOM) errors.
