package com.aura.ai.provider;

import com.aura.ai.dto.VideoGenerationRequest;

public interface LocalVideoProvider extends VideoGenerationProvider {
    boolean isLocal();
    String getLocalModelPath();
    String getGpuDevice();
}
