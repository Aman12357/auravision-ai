package com.aura.ai.prompt;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class PromptController {

    private final PromptEnhancementService promptEnhancementService;

    @Data
    public static class EnhancePromptRequest {
        private String prompt;
    }

    @Data
    public static class EnhancePromptResponse {
        private String enhancedPrompt;
        public EnhancePromptResponse(String enhancedPrompt) {
            this.enhancedPrompt = enhancedPrompt;
        }
    }

    @Data
    public static class GenerateStoryboardRequest {
        private String prompt;
        private int sceneCount;
    }
    
    @Data
    public static class ApiResponse<T> {
        private T data;
        public ApiResponse(T data) {
            this.data = data;
        }
    }

    @PostMapping("/enhance-prompt")
    public ResponseEntity<ApiResponse<EnhancePromptResponse>> enhancePrompt(@RequestBody EnhancePromptRequest request) {
        String enhanced = promptEnhancementService.enhancePrompt(request.getPrompt());
        return ResponseEntity.ok(new ApiResponse<>(new EnhancePromptResponse(enhanced)));
    }

    @PostMapping("/generate-storyboard")
    public ResponseEntity<ApiResponse<List<ScenePrompt>>> generateStoryboard(@RequestBody GenerateStoryboardRequest request) {
        List<ScenePrompt> scenes = promptEnhancementService.generateStoryboardScenes(request.getPrompt(), request.getSceneCount());
        return ResponseEntity.ok(new ApiResponse<>(scenes));
    }
}
