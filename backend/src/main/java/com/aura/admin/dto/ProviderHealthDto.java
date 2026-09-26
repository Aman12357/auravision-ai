package com.aura.admin.dto;

import java.time.ZonedDateTime;

public record ProviderHealthDto(
        String name,
        String displayName,
        boolean isEnabled,
        boolean isAvailable,
        String healthStatus,
        Double successRate,
        Double avgGenerationTimeSeconds,
        ZonedDateTime lastHealthCheck
) {}
