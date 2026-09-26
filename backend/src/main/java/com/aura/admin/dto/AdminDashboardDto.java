package com.aura.admin.dto;

import java.util.List;
import java.util.Map;

public record AdminDashboardDto(
        long totalUsers,
        long newUsersToday,
        long newUsersThisMonth,
        long totalWorkspaces,
        long totalVideosGenerated,
        long totalVideosToday,
        long totalCreditsConsumed,
        long totalRevenue,
        Map<String, Long> videosByProvider,
        Map<String, Double> providerSuccessRates,
        List<ProviderHealthDto> providerStatuses
) {}
