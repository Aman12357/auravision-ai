package com.aura.ai.provider;

public interface LocalAudioProvider {
    String getName();
    boolean isAvailable();
    String generateAudio(String textPrompt, String voiceId);
    String generateSubtitles(String audioFilePath, String format);
}
