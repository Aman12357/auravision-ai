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
public class CogVideoXProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${replicate.api-token:default-token}")
    private String apiToken;

    @Override
    public String getName() { return "COGVIDEOX"; }

    @Override
    public String getDisplayName() { return "THUDM/CogVideoX-5b"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, false, false, false, false, List.of("720p"), List.of("16:9"), 6, 6, 8, true, false, false, false, 80.0, 20);
    }

    @Override
    public int getPriority() { return 10; }

    @Override
    public int getCostPerSecond() { return 1; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.replicate.com/v1/predictions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);
        
        Map<String, Object> body = Map.of(
            "version", "cogvideox_hash_placeholder",
            "input", Map.of(
                "prompt", request.getPrompt(),
                "num_frames", 49,
                "fps", 8,
                "guidance_scale", 6
            )
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 6, "720p", null, null, 6);
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
        return new HealthCheckResult(true, "UP", 35, "Healthy", Instant.now());
    }
}
