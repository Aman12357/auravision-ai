# DATASET PLAN — AURAVISION AI

## 1. Dataset Architecture
Directory structure:
```
datasets/
├── train/
├── validation/
└── test/
```

Each sample record contains:
- `prompt.text`: Original user request
- `storyboard.json`: Shot breakdown, camera angles, timing
- `scene_graph.json`: 3D objects, positions, materials, lighting
- `blend_project.blend`: Source 3D project file
- `rendered_video.mp4`: Ground-truth 60FPS video render

## 2. Synthetic Dataset Factory (`AuraDatasetFactory`)
- **Procedural Variations**:
  - Characters: Size, armor, colors, joint proportions
  - Environments: Cyberpunk city, sci-fi lab, forest, space station
  - Weather/Lighting: Rain, fog, sunset, night neon, volumetric rays
  - Camera: Pan, dolly, orbit, zoom, lens focal length (24mm–85mm)
- **Quality Filtering (`DatasetValidator`)**: Rejects corrupted frames, clipping geometry, unassigned textures, or broken animation keyframes.

## 3. Dataset Versioning
- Releases: `v0.1` (1k samples), `v0.2` (10k synthetic samples), `v1.0` (Production dataset).
