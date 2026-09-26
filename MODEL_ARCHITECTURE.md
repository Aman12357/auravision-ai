# MODEL ARCHITECTURE — AURAVISION AI 13-MODEL ECOSYSTEM

```
USER PROMPT
   │
   ▼
[AuraDirector] (Project JSON Specification)
   │
   ▼
[AuraPlanner] (Task Graph DAG)
   │
   ├──────► [AuraStoryboard] (Shot Breakdown & Scene Cuts)
   ├──────► [AuraCharacter] (Rig Specification & Identity Manager)
   ├──────► [AuraAsset] (3D Prop & Mesh Specifications)
   ├──────► [AuraEnvironment] (World Procedural Terrain & Architecture)
   ├──────► [AuraAnimation] (Motion Keyframes & Bone Trajectories)
   ├──────► [AuraCamera] (Lens, Framing, Movement & DoF)
   ├──────► [AuraLighting] (3-Point, HDRI & Volumetric Setup)
   ├──────► [AuraVFX] (Rain, Fog, Particles & Physics)
   └──────► [AuraAudio] (TTS Dialogue, Music & SFX)
   │
   ▼
[Blender Automation Service] (Programmatic .blend Scene & Render)
   │
   ▼
[AuraQuality] (Validation & Self-Correction Loop)
   │
   ▼
FINAL 3D VIDEO (.mp4)
```

## Specialized Model Breakdown
1. **AuraDirector**: Text → Full Production JSON Plan.
2. **AuraPlanner**: Plan → Executable DAG Task Pipeline.
3. **AuraStoryboard**: Story → Timed Scene Cuts & Camera Directives.
4. **AuraCharacter**: Text → 3D Character Mesh & Rig Config.
5. **AuraAsset**: Text → 3D Object/Prop Parameters & Cache ID.
6. **AuraEnvironment**: Text → Procedural World & Building Nodes.
7. **AuraAnimation**: Text → Bone Motion & Keyframe Sequences.
8. **AuraCamera**: Shot Spec → 3D Camera Trajectories & Optics.
9. **AuraLighting**: Style → Shader Lighting Nodes & Volumetrics.
10. **AuraVFX**: Effect Spec → Particle Physics & Fluid Nodes.
11. **AuraAudio**: Dialogue/SFX → Timed Audio Tracks & Lip Sync.
12. **AuraVideo**: Composition → Final Motion Video Stream.
13. **AuraQuality**: Render → Artifact Inspection & Self-Repair Trigger.
