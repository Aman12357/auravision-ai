package com.aura.workspace.dto;
import com.aura.workspace.entity.WorkspaceMemberRole;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkspaceMemberDto(
    UUID id, UUID userId, String email, String fullName,
    String avatarUrl, WorkspaceMemberRole role, ZonedDateTime joinedAt
) {}
