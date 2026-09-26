package com.aura.analytics.service;

import com.aura.analytics.dto.DailyStatDto;
import com.aura.analytics.dto.WorkspaceAnalyticsDto;
import com.aura.analytics.entity.AnalyticsEvent;
import com.aura.analytics.repository.AnalyticsEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsEventRepository eventRepository;
    private final ObjectMapper objectMapper;

    @Async
    public void track(String eventName, String category, UUID userId, UUID workspaceId, Map<String, Object> properties, HttpServletRequest request) {
        try {
            AnalyticsEvent event = new AnalyticsEvent();
            event.setEventName(eventName);
            event.setEventCategory(category);
            event.setUserId(userId);
            event.setWorkspaceId(workspaceId);
            
            if (properties != null) {
                event.setProperties(objectMapper.writeValueAsString(properties));
            }
            
            if (request != null) {
                event.setIpAddress(request.getHeader("X-Forwarded-For") != null ? request.getHeader("X-Forwarded-For") : request.getRemoteAddr());
                event.setUserAgent(request.getHeader("User-Agent"));
                event.setReferrer(request.getHeader("Referer"));
                event.setPageUrl(request.getRequestURL().toString());
            }

            eventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to track analytics event", e);
        }
    }

    public WorkspaceAnalyticsDto getWorkspaceAnalytics(UUID workspaceId, int days) {
        ZonedDateTime startDate = ZonedDateTime.now().minusDays(days);

        List<DailyStatDto> videosPerDay = eventRepository.countVideosPerDay(workspaceId, startDate).stream()
                .map(row -> new DailyStatDto(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        List<DailyStatDto> creditsPerDay = eventRepository.sumCreditsPerDay(workspaceId, startDate).stream()
                .map(row -> new DailyStatDto(row[0].toString(), row[1] != null ? ((Number) row[1]).longValue() : 0L))
                .collect(Collectors.toList());

        Map<String, Long> videosByProvider = eventRepository.countVideosByProvider(workspaceId, startDate).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? row[0].toString() : "UNKNOWN",
                        row -> ((Number) row[1]).longValue()
                ));

        Map<String, Long> videosByJobType = eventRepository.countVideosByJobType(workspaceId, startDate).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? row[0].toString() : "UNKNOWN",
                        row -> ((Number) row[1]).longValue()
                ));

        long totalVideos = videosPerDay.stream().mapToLong(DailyStatDto::value).sum();
        long totalCredits = creditsPerDay.stream().mapToLong(DailyStatDto::value).sum();

        return new WorkspaceAnalyticsDto(
                videosPerDay,
                creditsPerDay,
                videosByProvider,
                videosByJobType,
                totalVideos,
                totalCredits
        );
    }
}
