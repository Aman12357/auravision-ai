package com.aura.ai.provider.impl;

import com.aura.ai.provider.LocalLLMProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class LocalLLMService implements LocalLLMProvider {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.local.llm-url:http://localhost:11434}")
    private String localLlmUrl;

    @Value("${app.ai.local.llm-model:llama3.2}")
    private String localLlmModel;

    @Override
    public String getName() {
        return "LOCAL_LLM";
    }

    @Override
    public boolean isAvailable() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(localLlmUrl + "/api/tags", String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Local LLM at {} is not reachable. Falling back to local internal prompt enhancer.", localLlmUrl);
            return false;
        }
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt) {
        if (isAvailable()) {
            try {
                Map<String, Object> requestBody = Map.of(
                    "model", localLlmModel,
                    "prompt", systemPrompt + "\n\nUser Prompt: " + userPrompt,
                    "stream", false
                );

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(localLlmUrl + "/api/generate", entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return (String) response.getBody().get("response");
                }
            } catch (Exception e) {
                log.error("Local LLM request failed: {}", e.getMessage());
            }
        }

        return fallbackEnhance(userPrompt);
    }

    @Override
    public String enhancePrompt(String userPrompt) {
        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            return userPrompt;
        }

        String systemPrompt = "You are a professional cinematographer and AI video prompt engineer. Enhance the prompt by adding cinematic language, camera movement descriptions, lighting details, and mood. Output only the enhanced prompt text.";
        return generateText(systemPrompt, userPrompt);
    }

    @Override
    public List<Map<String, Object>> generateStoryboard(String prompt, int sceneCount) {
        List<Map<String, Object>> scenes = new ArrayList<>();
        int durationPerScene = Math.max(3, 15 / sceneCount);

        for (int i = 1; i <= sceneCount; i++) {
            scenes.add(Map.of(
                "sceneIndex", i,
                "prompt", prompt + " - Scene " + i + " establishing cinematic shot",
                "negativePrompt", "blurry, low quality, distorted, artifacts",
                "duration", durationPerScene,
                "cameraMotion", i % 2 == 0 ? "Pan Right 45deg" : "Slow Dolly Zoom Forward",
                "lighting", "Cinematic Volumetric Golden Hour",
                "mood", "Epic Dramatic",
                "style", "Photorealistic 8K Cinema"
            ));
        }

        return scenes;
    }

    private String fallbackEnhance(String prompt) {
        String lower = prompt.toLowerCase();
        StringBuilder enhanced = new StringBuilder(prompt.trim());

        if (!lower.contains("cinematic") && !lower.contains("shot")) {
            enhanced.append(", cinematic 8K resolution, photorealistic ultra-detailed render");
        }
        if (!lower.contains("lighting") && !lower.contains("sun")) {
            enhanced.append(", dramatic volumetric lighting with high dynamic range");
        }
        if (!lower.contains("camera") && !lower.contains("zoom")) {
            enhanced.append(", 35mm lens camera smooth tracking shot");
        }

        return enhanced.toString();
    }
}
