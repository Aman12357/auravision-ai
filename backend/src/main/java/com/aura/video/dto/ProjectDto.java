package com.aura.video.dto;
import com.aura.video.entity.Project;
import com.aura.video.entity.ProjectStatus;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record ProjectDto(
    UUID id, String name, String description, ProjectStatus status,
    String thumbnailUrl, List<String> tags, UUID workspaceId, UUID userId,
    long jobCount, ZonedDateTime createdAt, ZonedDateTime updatedAt
) {
    public static ProjectDto fromProject(Project p, long jobCount) {
        return new ProjectDto(
            p.getId(), p.getName(), p.getDescription(), p.getStatus(),
            p.getThumbnailUrl(), p.getTags(), 
            p.getWorkspace() != null ? p.getWorkspace().getId() : null,
            p.getUser() != null ? p.getUser().getId() : null,
            jobCount, p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
