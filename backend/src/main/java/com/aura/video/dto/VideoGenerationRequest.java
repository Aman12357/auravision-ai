package com.aura.video.dto;
import com.aura.video.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VideoGenerationRequest(
    @NotBlank String prompt,
    String negativePrompt,
    @NotNull JobType jobType,
    Integer duration,
    Integer fps,
    String resolution,
    String aspectRatio,
    String cameraMotion,
    String lighting,
    String colorPalette,
    String style,
    String mood,
    String environment,
    String weather,
    Long seed,
    String referenceImageUrl,
    String referenceVideoUrl,
    UUID projectId,
    UUID sceneId,
    String preferredProvider,
    Boolean filmGrain,
    Boolean motionBlur,
    Boolean depthOfField
) {}
