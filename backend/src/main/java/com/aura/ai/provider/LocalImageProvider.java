package com.aura.ai.provider;

import java.util.Map;

public interface LocalImageProvider {
    String getName();
    boolean isAvailable();
    String generateImage(String prompt, String negativePrompt, String resolution, String style);
}
