package com.aura.analytics.repository;

import com.aura.analytics.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {

    @Query(value = "SELECT date(created_at) as event_date, COUNT(*) as count " +
            "FROM analytics_events " +
            "WHERE workspace_id = :workspaceId AND event_name = 'VIDEO_GENERATED' " +
            "AND created_at >= :startDate " +
            "GROUP BY date(created_at) ORDER BY event_date", nativeQuery = true)
    List<Object[]> countVideosPerDay(UUID workspaceId, ZonedDateTime startDate);

    // Mock query for credits sum since credits might be in another table or parsed from JSON
    @Query(value = "SELECT date(created_at) as event_date, SUM(CAST(properties->>'creditsUsed' AS INTEGER)) as sum " +
            "FROM analytics_events " +
            "WHERE workspace_id = :workspaceId AND event_name = 'CREDITS_USED' " +
            "AND created_at >= :startDate " +
            "GROUP BY date(created_at) ORDER BY event_date", nativeQuery = true)
    List<Object[]> sumCreditsPerDay(UUID workspaceId, ZonedDateTime startDate);
    
    @Query(value = "SELECT properties->>'provider' as provider, COUNT(*) as count " +
            "FROM analytics_events " +
            "WHERE workspace_id = :workspaceId AND event_name = 'VIDEO_GENERATED' " +
            "AND created_at >= :startDate " +
            "GROUP BY properties->>'provider'", nativeQuery = true)
    List<Object[]> countVideosByProvider(UUID workspaceId, ZonedDateTime startDate);

    @Query(value = "SELECT properties->>'jobType' as jobType, COUNT(*) as count " +
            "FROM analytics_events " +
            "WHERE workspace_id = :workspaceId AND event_name = 'VIDEO_GENERATED' " +
            "AND created_at >= :startDate " +
            "GROUP BY properties->>'jobType'", nativeQuery = true)
    List<Object[]> countVideosByJobType(UUID workspaceId, ZonedDateTime startDate);
}
