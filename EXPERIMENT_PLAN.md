# EXPERIMENT PLAN — SELF-IMPROVEMENT LOOP

## 1. Experiment Framework
Directory structure:
```
experiments/
├── exp_001_director_finetune/
├── exp_002_camera_trajectories/
└── exp_003_character_consistency/
```

## 2. Evaluation Metrics
- **AuraDirector**: JSON syntax validity, scene coverage, character preservation.
- **AuraCamera**: Smoothness score, framing precision, focus target alignment.
- **AuraQuality**: Render integrity score, zero clipping geometry, temporal 60FPS consistency.

## 3. Candidate Promotion Policy
Newly trained candidate models (`Candidate Model`) are evaluated against automated test benchmarks. Only candidate models achieving >95% quality score relative to baseline are promoted to `Production Model`.
