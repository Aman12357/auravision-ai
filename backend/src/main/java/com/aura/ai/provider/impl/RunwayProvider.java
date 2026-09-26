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
public class RunwayProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${runway.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() {
        return "RUNWAY";
    }

    @Override
    public String getDisplayName() {
        return "Runway Gen-3 Alpha";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public boolean supports(VideoGenerationRequest request) {
        return true;
    }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(
            true, true, true, false, false,
            List.of("1280x768", "768x1280"),
            List.of("16:9", "9:16"),
            10, 5, 24, true, false, true, false, 45.0, 60
        );
    }

    @Override
    public int getPriority() {
        return 2;
    }

    @Override
    public int getCostPerSecond() {
        return 6;
    }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.dev.runwayml.com/v1/image_to_video";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        headers.set("X-Runway-Version", "2024-09-13");
        
        Map<String, Object> body = Map.of(
            "promptImage", request.getInitialImageUrl() != null ? request.getInitialImageUrl() : "",
            "promptText", request.getPrompt() != null ? request.getPrompt() : "",
            "duration", request.getDurationSeconds() > 0 ? request.getDurationSeconds() : 5,
            "ratio", request.getAspectRatio() != null ? request.getAspectRatio() : "1280:768"
        );

        try {
            Map response = httpClient.postWithRetry(getName(), url, body, headers, Map.class);
            String taskId = (String) response.get("id");
            
            return new GenerationResult(
                taskId, GenerationStatus.PENDING, null, null, request.getDurationSeconds(), "720p", null, null, getCostPerSecond() * 5
            );
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.dev.runwayml.com/v1/tasks/" + providerJobId;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.set("X-Runway-Version", "2024-09-13");

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String status = (String) response.get("status");
            
            if ("SUCCEEDED".equalsIgnoreCase(status)) {
                return GenerationStatus.COMPLETED;
            } else if ("FAILED".equalsIgnoreCase(status)) {
                return GenerationStatus.FAILED;
            }
            return GenerationStatus.PROCESSING;
        } catch (Exception e) {
            throw new ProviderException(getName(), "STATUS_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public void cancelJob(String providerJobId) throws ProviderException {
    }

    @Override
    public HealthCheckResult healthCheck() {
        return new HealthCheckResult(true, "UP", 50, "Healthy", Instant.now());
    }
}
