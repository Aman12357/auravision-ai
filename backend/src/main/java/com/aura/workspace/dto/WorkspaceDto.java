package com.aura.workspace.dto;
import com.aura.workspace.entity.Workspace;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkspaceDto(
    UUID id, String name, String slug, String description, String avatarUrl,
    String plan, Long creditsBalance, Long storageUsedBytes, Long storageLimitBytes,
    int memberCount, UUID ownerId, ZonedDateTime createdAt
) {
    public static WorkspaceDto fromWorkspace(Workspace w) {
        return new WorkspaceDto(
            w.getId(), w.getName(), w.getSlug(), w.getDescription(), w.getAvatarUrl(),
            w.getPlan(), w.getCreditsBalance(), w.getStorageUsedBytes(), w.getStorageLimitBytes(),
            w.getMembers() != null ? w.getMembers().size() : 0,
            w.getOwner() != null ? w.getOwner().getId() : null,
            w.getCreatedAt()
        );
    }
}
