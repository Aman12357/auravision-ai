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
public class MinimaxProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${minimax.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "MINIMAX"; }

    @Override
    public String getDisplayName() { return "MiniMax Video-01"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, true, false, false, false, List.of("1080p"), List.of("16:9"), 6, 6, 24, false, false, false, false, 60.0, 20);
    }

    @Override
    public int getPriority() { return 6; }

    @Override
    public int getCostPerSecond() { return 3; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String url = "https://api.minimaxi.chat/v1/video_generation";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> body = Map.of(
            "model", "video-01",
            "prompt", request.getPrompt()
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            String id = (String) response.get("task_id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 6, "1080p", null, null, 18);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.minimaxi.chat/v1/query/video_generation?task_id=" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            String status = (String) response.get("status");
            
            if ("Success".equalsIgnoreCase(status)) return GenerationStatus.COMPLETED;
            if ("Fail".equalsIgnoreCase(status)) return GenerationStatus.FAILED;
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
