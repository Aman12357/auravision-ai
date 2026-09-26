package com.aura.video.dto;
import jakarta.validation.constraints.NotBlank;

public record CreateSceneRequest(
    Integer sceneIndex,
    String title,
    @NotBlank String prompt,
    String negativePrompt,
    Integer duration,
    Integer fps,
    String resolution,
    String aspectRatio,
    String cameraMotion,
    String lighting,
    String style,
    String mood,
    String environment,
    String weather,
    Long seed
) {}
