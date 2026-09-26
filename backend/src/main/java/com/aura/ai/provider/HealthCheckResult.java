package com.aura.ai.provider;

import java.time.Instant;

public record HealthCheckResult(
    boolean healthy,
    String status,
    long responseTimeMs,
    String message,
    Instant checkedAt
) {}
