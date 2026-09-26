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
public class PixVerseProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${pixverse.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "PIXVERSE"; }

    @Override
    public String getDisplayName() { return "PixVerse AI"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, false, false, false, false, List.of("1080p"), List.of("16:9"), 5, 5, 24, true, true, false, false, 40.0, 20);
    }

    @Override
    public int getPriority() { return 7; }

    @Override
    public int getCostPerSecond() { return 3; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.pixverse.ai/v1/video/text";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("API-KEY", apiKey);
        
        Map<String, Object> body = Map.of(
            "prompt", request.getPrompt(),
            "style", "realistic",
            "quality", "1080p"
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            Map respObj = (Map) response.get("Resp");
            String id = respObj != null ? (String) respObj.get("video_id") : (String) response.get("video_id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 5, "1080p", null, null, 15);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.pixverse.ai/v1/video/" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("API-KEY", apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            Map respObj = (Map) response.get("Resp");
            if (respObj == null) return GenerationStatus.PROCESSING;
            
            Integer status = (Integer) respObj.get("status");
            if (status == null) return GenerationStatus.PROCESSING;
            
            if (status == 2) return GenerationStatus.COMPLETED;
            if (status == 3) return GenerationStatus.FAILED;
            return GenerationStatus.PROCESSING;
        } catch (Exception e) {
            throw new ProviderException(getName(), "STATUS_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public void cancelJob(String providerJobId) throws ProviderException { }

    @Override
    public HealthCheckResult healthCheck() {
        return new HealthCheckResult(true, "UP", 25, "Healthy", Instant.now());
    }
}
