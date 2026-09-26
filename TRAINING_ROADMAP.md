# AURAVISION AI — TRAINING ROADMAP

## Model Training Evolution Levels

### Level 1: Foundation Baseline (Current)
- Deploy open-weight foundation models locally (Ollama Llama 3 8B, AnimateDiff v3, SDXL Turbo, Blender Python 4.x).

### Level 2: Director & Storyboard Fine-Tuning
- Fine-tune `AuraDirector` and `AuraStoryboard` on structured 3D project plans and scene JSON specifications.

### Level 3: Camera & Lighting Director Training
- Train `AuraCamera` and `AuraLighting` using supervised cinematic shot datasets and synthetic Blender camera trajectories.

### Level 4: Synthetic 3D Dataset Factory
- Deploy `AuraDatasetFactory` to procedurally render 10,000+ Blender scenes with randomized characters, lighting, environments, and ground-truth metadata.

### Level 5: Character & Motion Alignment
- Fine-tune `AuraCharacter` and `AuraAnimation` on 3D skeletal motion capture (BVH/FBX) datasets for consistent character rigs across scenes.

### Level 6: Local Video Fine-Tuning & Quality Evaluation
- Fine-tune `AuraVideo` temporal LoRAs and deploy `AuraQuality` evaluator for automatic self-correction and validation.
