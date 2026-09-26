package com.aura.video.dto;
import com.aura.video.entity.Storyboard;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record StoryboardDto(
    UUID id, UUID projectId, String title, String description,
    Integer totalDuration, String status, List<SceneDto> scenes, ZonedDateTime createdAt
) {
    public static StoryboardDto fromStoryboard(Storyboard s) {
        return new StoryboardDto(
            s.getId(),
            s.getProject() != null ? s.getProject().getId() : null,
            s.getTitle(), s.getDescription(), s.getTotalDuration(), s.getStatus(),
            s.getScenes() != null ? s.getScenes().stream().map(SceneDto::fromScene).collect(Collectors.toList()) : null,
            s.getCreatedAt()
        );
    }
}
