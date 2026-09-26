package com.aura.ai.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ModelRegistry {

    @Data
    @Builder
    public static class LocalModelInfo {
        private String id;
        private String name;
        private String type; // LLM, IMAGE, VIDEO, AUDIO, TTS
        private String license;
        private long requiredVramMb;
        private boolean commercialUse;
        private String localPath;
        private boolean isLoaded;
    }

    private final Map<String, LocalModelInfo> models = new ConcurrentHashMap<>();

    public ModelRegistry() {
        registerDefaultModels();
    }

    private void registerDefaultModels() {
        models.put("aura-video-v1", LocalModelInfo.builder()
            .id("aura-video-v1")
            .name("AuraVision Local Video Synthesizer v1.0")
            .type("VIDEO")
            .license("Apache-2.0")
            .requiredVramMb(6144L)
            .commercialUse(true)
            .localPath("/models/video/aura-video-v1.safetensors")
            .isLoaded(true)
            .build());

        models.put("llama3.2", LocalModelInfo.builder()
            .id("llama3.2")
            .name("Llama 3.2 3B Instruct")
            .type("LLM")
            .license("Llama 3.2 Community License")
            .requiredVramMb(3072L)
            .commercialUse(true)
            .localPath("/models/llm/llama-3.2-3b-instruct.gguf")
            .isLoaded(true)
            .build());

        models.put("stable-diffusion-xl", LocalModelInfo.builder()
            .id("stable-diffusion-xl")
            .name("SDXL Turbo Refiner")
            .type("IMAGE")
            .license("OpenRAIL-M")
            .requiredVramMb(4096L)
            .commercialUse(true)
            .localPath("/models/image/sdxl-turbo.safetensors")
            .isLoaded(false)
            .build());
    }

    public List<LocalModelInfo> getAllModels() {
        return List.copyOf(models.values());
    }

    public LocalModelInfo getModel(String id) {
        return models.get(id);
    }
}
