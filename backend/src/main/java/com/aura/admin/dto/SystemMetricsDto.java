package com.aura.admin.dto;

public record SystemMetricsDto(
        long jvmMemoryUsedMB,
        long jvmMemoryTotalMB,
        int threadCount,
        long uptime,
        int activeJobsCount,
        int queuedJobsCount
) {}
