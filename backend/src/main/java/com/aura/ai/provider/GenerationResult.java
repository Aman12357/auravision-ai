package com.aura.ai.provider;

import java.util.Map;

public record GenerationResult(
    String providerJobId,
    GenerationStatus status,
    String videoUrl,
    String thumbnailUrl,
    int durationSeconds,
    String resolution,
    Map<String, Object> metadata,
    String errorMessage,
    int creditsUsed
) {}
