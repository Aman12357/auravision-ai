package com.aura.ai.provider.impl;

import com.aura.ai.dto.VideoGenerationRequest;
import com.aura.ai.provider.GenerationResult;
import com.aura.ai.provider.GenerationStatus;
import com.aura.ai.provider.HealthCheckResult;
import com.aura.ai.provider.LocalVideoProvider;
import com.aura.ai.provider.ProviderCapabilities;
import com.aura.ai.provider.ProviderException;
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
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LocalVideoService implements LocalVideoProvider {

    private final ProviderHttpClient httpClient;

    @Value("${app.ai.local.video-engine-url:http://localhost:8000}")
    private String videoEngineUrl;

    @Value("${app.ai.local.gpu-device:cuda:0}")
    private String gpuDevice;

    @Value("${app.ai.local.model-path:/models/video/aura-video-v1.safetensors}")
    private String modelPath;

    @Override
    public String getName() {
        return "LOCAL_AI_ENGINE";
    }

    @Override
    public String getDisplayName() {
        return "AuraVision Local PyTorch 3D AI Engine";
    }

    @Override
    public boolean isLocal() {
        return true;
    }

    @Override
    public String getLocalModelPath() {
        return modelPath;
    }

    @Override
    public String getGpuDevice() {
        return gpuDevice;
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
            true, true, true, true, true,
            List.of("720p", "1080p", "4K"),
            List.of("16:9", "9:16", "1:1"),
            300, 5, 60, true, true, true, true, 99.0, 0
        );
    }

    @Override
    public int getPriority() {
        return 100;
    }

    @Override
    public int getCostPerSecond() {
        return 0;
    }

    @Override
    public GenerationResult generateVideo(VideoGenerationRequest request) throws ProviderException {
        String jobId = "local-job-" + UUID.randomUUID().toString();
        log.info("Dispatching local 3D video generation task {} to AI Engine at {}", jobId, videoEngineUrl);

        try {
            String url = videoEngineUrl + "/api/v1/generate-video";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "jobId", jobId,
                "prompt", request.getPrompt(),
                "negativePrompt", request.getNegativePrompt() != null ? request.getNegativePrompt() : "",
                "aspectRatio", request.getAspectRatio() != null ? request.getAspectRatio() : "16:9",
                "resolution", request.getResolution() != null ? request.getResolution() : "1080p",
                "duration", request.getDurationSeconds() > 0 ? request.getDurationSeconds() : 30,
                "gpuDevice", gpuDevice
            );

            Map response = httpClient.post(getName(), url, body, headers, Map.class);
            if (response != null && response.containsKey("videoUrl")) {
                String videoUrl = (String) response.get("videoUrl");
                String posterUrl = (String) response.getOrDefault("posterUrl", "");
                String providerJobId = (String) response.getOrDefault("jobId", jobId);

                return new GenerationResult(
                    providerJobId,
                    GenerationStatus.COMPLETED,
                    videoUrl,
                    posterUrl,
                    request.getDurationSeconds(),
                    request.getResolution(),
                    null,
                    null,
                    0
                );
            }
        } catch (Exception e) {
            log.error("Local Python AI engine execution failed for job {}: {}", jobId, e.getMessage());
        }

        // NO SAMPLE VIDEO FALLBACK. Return explicit FAILED state on error!
        return new GenerationResult(
            jobId,
            GenerationStatus.FAILED,
            null,
            null,
            request.getDurationSeconds(),
            request.getResolution(),
            Map.of("errorCode", "LOCAL_ENGINE_UNAVAILABLE"),
            "Python 3D AI Engine is offline or failed to generate frames. Ensure FastAPI is running on http://localhost:8000.",
            0
        );
    }

    @Override
    public GenerationStatus checkStatus(String providerJobId) throws ProviderException {
        try {
            String url = videoEngineUrl + "/api/v1/jobs/" + providerJobId;
            Map response = httpClient.get(getName(), url, new HttpHeaders(), Map.class);
            if (response != null && response.containsKey("status")) {
                String statusStr = (String) response.get("status");
                return GenerationStatus.valueOf(statusStr.toUpperCase());
            }
        } catch (Exception ignored) {}
        return GenerationStatus.PROCESSING;
    }

    @Override
    public void cancelJob(String providerJobId) throws ProviderException {
        try {
            String url = videoEngineUrl + "/api/v1/jobs/" + providerJobId + "/cancel";
            httpClient.post(getName(), url, Map.of(), new HttpHeaders(), Map.class);
        } catch (Exception ignored) {}
    }

    @Override
    public HealthCheckResult healthCheck() {
        try {
            String url = videoEngineUrl + "/api/v1/health";
            Map response = httpClient.get(getName(), url, new HttpHeaders(), Map.class);
            if (response != null && "UP".equals(response.get("status"))) {
                return new HealthCheckResult(true, "UP", 5, "Local 3D AI Engine Online", Instant.now());
            }
        } catch (Exception ignored) {}
        return new HealthCheckResult(false, "DOWN", 5, "Local 3D AI Engine Offline", Instant.now());
    }
}
