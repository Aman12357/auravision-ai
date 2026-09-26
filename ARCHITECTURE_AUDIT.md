# ARCHITECTURE AUDIT: AuraVision AI — Self-Trained 3D Video Ecosystem

## 1. Executive Overview
AuraVision AI is evolving from a single local fallback provider into a modular, self-trained 3D video generation ecosystem. The architecture decouples monolithic video generation into 13 specialized local AI models coordinated by `AuraDirector` and rendered programmatically via Blender.

## 2. Current Subsystem Status
- **Backend (Spring Boot 3.3 / Java 21)**: Fully offline-capable JWT/REST API managing users, workspaces, project DAGs, and job orchestration.
- **Frontend (Next.js 14 / Tailwind)**: 60FPS Hardware-Accelerated 3D Character Motion & Canvas Studio.
- **AI Orchestration**: Monolithic cloud calls (Gemini, Veo, OpenAI) purged. Routed to local Ollama LLM and Python 3D engine interfaces.
- **Blender Automation API**: Headless Blender Python scripts (`blender --background --python`) for procedural mesh generation, PBR shader nodes, skeletal rigging, camera paths, and EEVEE/Cycles rendering.

## 3. Dependency Audit
- **Gemini / Veo / OpenAI**: 100% Purged.
- **Local AI Engines**: Ollama (Llama 3 / Mistral), PyTorch local animation pipelines, Blender API 4.x.
- **Storage & DB**: Local file storage, PostgreSQL schema, Redis caching.
