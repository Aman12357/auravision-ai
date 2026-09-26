package com.aura.ai.provider;

import com.aura.ai.dto.VideoGenerationRequest;

public interface VideoGenerationProvider {
    String getName();
    String getDisplayName();
    boolean isAvailable();
    boolean supports(VideoGenerationRequest request);
    ProviderCapabilities getCapabilities();
    int getPriority();
    int getCostPerSecond();
    
    GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException;
    GenerationStatus checkStatus(String providerJobId) throws ProviderException;
    void cancelJob(String providerJobId) throws ProviderException;
    HealthCheckResult healthCheck();
}
