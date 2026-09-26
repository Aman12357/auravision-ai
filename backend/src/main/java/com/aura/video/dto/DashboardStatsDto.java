package com.aura.video.dto;

public record DashboardStatsDto(
    long totalProjects,
    long totalVideosGenerated,
    long creditsUsedThisMonth,
    long creditsBalance,
    long activeJobs,
    long completedJobs,
    long storageUsedBytes,
    String storageUsedFormatted
) {}
