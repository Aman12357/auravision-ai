package com.aura.ai.provider.impl;

import com.aura.ai.dto.VideoGenerationRequest;
import com.aura.ai.provider.*;
import com.aura.ai.provider.http.ProviderHttpClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class LumaProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${luma.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "LUMA"; }

    @Override
    public String getDisplayName() { return "Luma Dream Machine"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(
            true, true, false, false, false,
            List.of("720p"), List.of("16:9", "9:16", "1:1", "4:3"),
            5, 5, 24, false, false, true, false, 60.0, 30
        );
    }

    @Override
    public int getPriority() { return 3; }

    @Override
    public int getCostPerSecond() { return 4; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.lumalabs.ai/dream-machine/v1/generations";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> body = Map.of(
            "prompt", request.getPrompt(),
            "aspect_ratio", request.getAspectRatio() != null ? request.getAspectRatio() : "16:9",
            "loop", false
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 5, "720p", null, null, 20);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.lumalabs.ai/dream-machine/v1/generations/" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String state = (String) response.get("state");
            
            if ("completed".equalsIgnoreCase(state)) return GenerationStatus.COMPLETED;
            if ("failed".equalsIgnoreCase(state)) return GenerationStatus.FAILED;
            return GenerationStatus.PROCESSING;
        } catch (Exception e) {
            throw new ProviderException(getName(), "STATUS_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public void cancelJob(String providerJobId) throws ProviderException { }

    @Override
    public HealthCheckResult healthCheck() {
        return new HealthCheckResult(true, "UP", 30, "Healthy", Instant.now());
    }
}
