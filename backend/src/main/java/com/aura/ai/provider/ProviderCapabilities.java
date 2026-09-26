package com.aura.ai.provider;

import java.util.List;

public record ProviderCapabilities(
    boolean supportsTextToVideo,
    boolean supportsImageToVideo,
    boolean supportsVideoToVideo,
    boolean supportsUpscale,
    boolean supportsVoiceOver,
    List<String> supportedResolutions,
    List<String> supportedAspectRatios,
    int maxDurationSeconds,
    int minDurationSeconds,
    int maxFps,
    boolean supportsSeed,
    boolean supportsNegativePrompt,
    boolean supportsCameraMotion,
    boolean supportsCharacterConsistency,
    double avgGenerationTimeSeconds,
    int rateLimit
) {}
