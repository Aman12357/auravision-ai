package com.aura.ai.provider;

import java.util.List;
import java.util.Map;

public interface LocalLLMProvider {
    String getName();
    boolean isAvailable();
    String generateText(String systemPrompt, String userPrompt);
    String enhancePrompt(String userPrompt);
    List<Map<String, Object>> generateStoryboard(String prompt, int sceneCount);
}
