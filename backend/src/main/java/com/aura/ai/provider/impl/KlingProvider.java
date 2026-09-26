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
public class KlingProvider implements VideoGenerationProvider {

    private final ProviderHttpClient httpClient;

    @Value("${kling.api-key:default-key}")
    private String apiKey;

    @Override
    public String getName() { return "KLING"; }

    @Override
    public String getDisplayName() { return "Kling AI"; }

    @Override
    public boolean isAvailable() { return true; }

    @Override
    public boolean supports(VideoGenerationRequest request) { return true; }

    @Override
    public ProviderCapabilities getCapabilities() {
        return new ProviderCapabilities(true, true, false, false, false, List.of("1080p"), List.of("16:9"), 10, 5, 30, true, true, true, false, 45.0, 20);
    }

    @Override
    public int getPriority() { return 5; }

    @Override
    public int getCostPerSecond() { return 4; }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String endpoint = request.getInitialImageUrl() != null ? "/image2video" : "/text2video";
        String url = "https://api.klingai.com/v1/videos" + endpoint;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> body = Map.of(
            "prompt", request.getPrompt(),
            "mode", "std",
            "duration", 5,
            "aspect_ratio", "16:9"
        );

        try {
            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            Map data = (Map) response.get("data");
            String id = data != null ? (String) data.get("task_id") : (String) response.get("task_id");
            return new GenerationResult(id, GenerationStatus.PENDING, null, null, 5, "1080p", null, null, 20);
        } catch (Exception e) {
            throw new ProviderException(getName(), "GENERATE_FAILED", e.getMessage(), true, e);
        }
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        String url = "https://api.klingai.com/v1/videos/text2video/" + providerJobId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);

        try {
            Map response = httpClient.get(getName(), url, headers, Map.class);
            Map data = (Map) response.get("data");
            String status = data != null ? (String) data.get("task_status") : "";
            
            if ("succeed".equalsIgnoreCase(status)) return GenerationStatus.COMPLETED;
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
        return new HealthCheckResult(true, "UP", 40, "Healthy", Instant.now());
    }
}
