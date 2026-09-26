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
public class WanVideoProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${fal.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "WAN_VIDEO"; }

    @Override
    public String getDisplayName() { return "Wan 2.1 via Fal"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, true, false, false, false, List.of("1080p"), List.of("16:9"), 10, 5, 24, true, true, false, false, 55.0, 30);
    }

    @Override
    public int getPriority() { return 11; }

    @Override
    public int getCostPerSecond() { return 2; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://queue.fal.run/fal-ai/wan/v2.1/1.3b";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Key " + apiKey);
        
        Map<String, Object> body = Map.of(
            "prompt", request.getPrompt(),
            "resolution", "1080p",
            "num_frames", 120,
            "fps", 24
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("request_id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 5, "1080p", null, null, 10);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://queue.fal.run/fal-ai/wan/requests/" + providerJobId + "/status";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Key " + apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String status = (String) response.get("status");
            
            if ("COMPLETED".equalsIgnoreCase(status)) return GenerationStatus.COMPLETED;
            if ("IN_QUEUE".equalsIgnoreCase(status) || "IN_PROGRESS".equalsIgnoreCase(status)) return GenerationStatus.PROCESSING;
            return GenerationStatus.FAILED;
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
