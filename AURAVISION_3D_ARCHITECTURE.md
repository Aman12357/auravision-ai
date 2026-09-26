# AURAVISION 3D ARCHITECTURE SPECIFICATION

## System Architecture Overview

```
                          +-----------------------------------+
                          |     Next.js 14 Web Studio UI      |
                          | (Autonomous 3D Prompt & Controls) |
                          +-----------------+-----------------+
                                            | REST / WebSocket
                                            v
                          +-----------------+-----------------+
                          |     Spring Boot 3.3 Backend       |
                          |   (Java 21 / PostgreSQL / Redis)  |
                          +-----------------+-----------------+
                                            | gRPC / HTTP
                                            v
+---------------------------------------------------------------------------------------+
|                              PYTHON AI 3D ENGINE                                      |
|                                                                                       |
|  +--------------------+   +---------------------+   +------------------------------+  |
|  |    AuraDirector    |-->|   Story / Scene     |-->|   Blender Python Automation  |  |
|  |  (Local Ollama LLM)|   |   Graph Planner     |   |   (`blender --background`)   |  |
|  +--------------------+   +---------------------+   +--------------+---------------+  |
|                                                                    |                  |
|  +-----------------------------------------------------------------+---------------+  |
|  |                                                                                 |  |
|  v                                                                                 v  |
| +-------------------------+  +--------------------------+  +---------------------+ |  |
| | 3D Character & Rigging  |  | Environment & Geometry   |  | Materials & Textures| |  |
| |   (Procedural Meshes)   |  |    Nodes Generation      |  |  (PBR Shader Nodes) | |  |
| +------------+------------+  +------------+-------------+  +----------+----------+ |  |
|              |                            |                           |            |  |
|              +----------------------------+---------------------------+            |  |
|                                           |                                        |  |
|                                           v                                        |  |
|                              +------------+------------+                           |  |
|                              |  Cinematic Camera &     |                           |  |
|                              |  Lighting Director      |                           |  |
|                              +------------+------------+                           |  |
|                                           |                                        |  |
|                                           v                                        |  |
|                              +------------+------------+                           |  |
|                              | Blender EEVEE / Cycles  |                           |  |
|                              |     Frame Render        |                           |  |
|                              +------------+------------+                           |  |
|                                           |                                        |  |
+-------------------------------------------|----------------------------------------+
                                            v
                               +------------+------------+
                               | FFmpeg Audio & Video    |
                               |   Compositor & Edit     |
                               +------------+------------+
                                            |
                                            v
                               +------------+------------+
                               | Editable `.blend` File  |
                               |  & Final `.mp4` Video   |
                               +-------------------------+
```

---

## Core Components & Data Flow

### 1. AuraDirector (Autonomous Story & Scene Graph Planner)
Input: User Natural-Language Prompt  
Output: `StructuredProjectPlan` JSON

```json
{
  "projectId": "proj-3d-001",
  "title": "Futuristic Robot in Neon Rain City",
  "durationSeconds": 30,
  "fps": 30,
  "style": "CINEMATIC_3D",
  "characters": [
    {
      "id": "char-robot-01",
      "name": "Humanoid Android",
      "type": "ROBOT",
      "armorColor": "#06B6D4",
      "eyeGlow": "#38BDF8",
      "height": 1.8
    }
  ],
  "environments": [
    {
      "id": "env-neon-city",
      "type": "CYBERPUNK_CITY",
      "timeOfDay": "NIGHT",
      "weather": "RAIN",
      "fogDensity": 0.05
    }
  ],
  "scenes": [
    {
      "sceneId": 1,
      "duration": 10,
      "camera": { "type": "TRACKING_PAN", "start": [0, -5, 1.5], "end": [0, 5, 1.5] },
      "action": "Robot walks down wet neon street"
    },
    {
      "sceneId": 2,
      "duration": 20,
      "camera": { "type": "ORBIT_CLOSEUP", "target": "char-robot-01" },
      "action": "Robot discovers glowing blue portal and reaches out hand"
    }
  ]
}
```

---

## 2. Blender Automation Engine (`ai-engine/blender/`)
- Executes headless via `blender --background --python blender_director.py`
- Programmatically constructs 3D Meshes, Rigging Skeletons, Keyframes, Material Shader Trees, Particle Physics (Rain/Fog), Camera Paths, and EEVEE/Cycles render settings.
- Saves output both as a standalone `.blend` project file and rendered frame sequences.

---

## 3. Video Editing & Audio Compositor (`ai-engine/rendering/`)
- Stitches rendered scene clips, applies local audio TTS dialogue, background music tracks, and outputs high-quality `.mp4` video.
