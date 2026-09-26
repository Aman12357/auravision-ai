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
public class PikaProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${pika.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "PIKA"; }

    @Override
    public String getDisplayName() { return "Pika Art v2"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, true, false, false, false, List.of("1080p"), List.of("16:9"), 15, 3, 24, true, true, true, false, 30.0, 30);
    }

    @Override
    public int getPriority() { return 4; }

    @Override
    public int getCostPerSecond() { return 3; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.pika.art/v2/generate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> body = Map.of(
            "promptText", request.getPrompt(),
            "model", "pika-2.0",
            "duration", request.getDurationSeconds() > 0 ? request.getDurationSeconds() : 3
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("task_id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 3, "1080p", null, null, 9);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.pika.art/v2/tasks/" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String status = (String) response.get("status");
            if ("finished".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) return GenerationStatus.COMPLETED;
            if ("failed".equalsIgnoreCase(status)) return GenerationStatus.FAILED;
            return GenerationStatus.PROCESSING;
        } catch (Exception e) {
            throw new ProviderException(getName(), "STATUS_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public void cancelJob(String providerJobId) throws ProviderException { }

    @Override
    public HealthCheckResult healthCheck() {
        return new HealthCheckResult(true, "UP", 20, "Healthy", Instant.now());
    }
}
