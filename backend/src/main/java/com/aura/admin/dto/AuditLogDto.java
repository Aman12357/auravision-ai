package com.aura.admin.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public record AuditLogDto(
        UUID id,
        UUID userId,
        String userEmail,
        String action,
        String resourceType,
        String resourceId,
        String ipAddress,
        String outcome,
        String details,
        ZonedDateTime createdAt
) {}
