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
public class ReplicateProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${replicate.api-token:default-token}")
    private String apiToken;

    @Override
    public String getName() { return "REPLICATE"; }

    @Override
    public String getDisplayName() { return "Replicate Platform"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, true, true, false, false, List.of("1080p"), List.of("16:9"), 10, 5, 24, true, true, false, false, 50.0, 30);
    }

    @Override
    public int getPriority() { return 9; }

    @Override
    public int getCostPerSecond() { return 2; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.replicate.com/v1/predictions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);
        
        // using a placeholder version for minimax or luma via replicate
        Map<String, Object> body = Map.of(
            "version", "minimax_placeholder_version",
            "input", Map.of("prompt", request.getPrompt())
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 5, "1080p", null, null, 10);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.replicate.com/v1/predictions/" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String status = (String) response.get("status");
            
            if ("succeeded".equalsIgnoreCase(status)) return GenerationStatus.COMPLETED;
            if ("failed".equalsIgnoreCase(status) || "canceled".equalsIgnoreCase(status)) return GenerationStatus.FAILED;
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
