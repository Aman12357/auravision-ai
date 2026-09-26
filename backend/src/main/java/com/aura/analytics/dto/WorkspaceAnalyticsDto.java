package com.aura.analytics.dto;

import java.util.List;
import java.util.Map;

public record WorkspaceAnalyticsDto(
        List<DailyStatDto> videosPerDay,
        List<DailyStatDto> creditsPerDay,
        Map<String, Long> videosByProvider,
        Map<String, Long> videosByJobType,
        long totalVideosInPeriod,
        long totalCreditsInPeriod
) {}
