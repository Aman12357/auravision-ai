package com.aura.ai.prompt;

public record ScenePrompt(
    int sceneIndex,
    String prompt,
    String negativePrompt,
    int duration,
    String cameraMotion,
    String lighting,
    String mood,
    String style
) {}
