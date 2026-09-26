package com.aura.video.dto;
import com.aura.video.entity.Scene;
import java.time.ZonedDateTime;
import java.util.UUID;

public record SceneDto(
    UUID id, Integer sceneIndex, String title, String prompt, String negativePrompt,
    Integer duration, Integer fps, String resolution, String aspectRatio,
    String cameraMotion, String style, String mood, String status, ZonedDateTime createdAt
) {
    public static SceneDto fromScene(Scene s) {
        return new SceneDto(
            s.getId(), s.getSceneIndex(), s.getTitle(), s.getPrompt(), s.getNegativePrompt(),
            s.getDuration(), s.getFps(), s.getResolution(), s.getAspectRatio(),
            s.getCameraMotion(), s.getStyle(), s.getMood(), s.getStatus(), s.getCreatedAt()
        );
    }
}
