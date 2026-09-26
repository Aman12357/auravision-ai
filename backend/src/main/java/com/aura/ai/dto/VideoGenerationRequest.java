package com.aura.ai.dto;

import java.util.UUID;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoGenerationRequest {
    private UUID jobId;
    private String prompt;
    private String negativePrompt;
    private String initialImageUrl;
    private String referenceVideoUrl;
    private int durationSeconds;
    private String resolution;
    private String aspectRatio;
    private boolean useCameraMotion;
    private boolean useCharacterConsistency;
    private String style;
}
