package com.aura.ai.prompt;

import com.aura.ai.provider.LocalLLMProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PromptEnhancementService {

    private final LocalLLMProvider localLLMProvider;

    public String enhancePrompt(String userPrompt) {
        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            return userPrompt;
        }

        try {
            return localLLMProvider.enhancePrompt(userPrompt);
        } catch (Exception e) {
            log.error("Failed to enhance prompt using Local LLM Provider, returning original. Error: {}", e.getMessage());
            return userPrompt;
        }
    }

    public List<ScenePrompt> generateStoryboardScenes(String prompt, int sceneCount) {
        List<ScenePrompt> scenes = new ArrayList<>();
        try {
            List<Map<String, Object>> rawScenes = localLLMProvider.generateStoryboard(prompt, sceneCount);
            for (Map<String, Object> s : rawScenes) {
                int index = (Integer) s.get("sceneIndex");
                String p = (String) s.get("prompt");
                String neg = (String) s.get("negativePrompt");
                int dur = (Integer) s.get("duration");
                String cam = (String) s.get("cameraMotion");
                String light = (String) s.get("lighting");
                String mood = (String) s.get("mood");
                String style = (String) s.get("style");

                scenes.add(new ScenePrompt(index, p, neg, dur, cam, light, mood, style));
            }
            return scenes;
        } catch (Exception e) {
            log.error("Failed to generate storyboard scenes with Local LLM. Error: {}", e.getMessage());
            scenes.add(new ScenePrompt(1, prompt, "", 5, "steady", "natural", "neutral", "realistic"));
            return scenes;
        }
    }
}
