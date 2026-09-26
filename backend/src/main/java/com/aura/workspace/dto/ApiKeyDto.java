package com.aura.workspace.dto;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record ApiKeyDto(
        UUID id,
        String name,
        String keyPrefix,
        List<String> scopes,
        int rateLimitRpm,
        boolean isActive,
        ZonedDateTime lastUsedAt,
        ZonedDateTime expiresAt,
        ZonedDateTime createdAt
) {}
