package com.aura.ai.repository;

import com.aura.ai.entity.RoutingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoutingLogRepository extends JpaRepository<RoutingLog, UUID> {
    List<RoutingLog> findByJobId(UUID jobId);
    List<RoutingLog> findByProviderNameAndCreatedAtAfter(String name, ZonedDateTime since);

    @Query("SELECT SUM(CASE WHEN r.wasSuccessful = true THEN 1.0 ELSE 0.0 END) / COUNT(r) " +
           "FROM RoutingLog r WHERE r.providerName = :providerName AND r.createdAt >= :since")
    Double calculateSuccessRate(@Param("providerName") String providerName, @Param("since") ZonedDateTime since);

    @Query("SELECT AVG(r.responseTimeMs) FROM RoutingLog r WHERE r.providerName = :providerName AND r.createdAt >= :since AND r.responseTimeMs IS NOT NULL")
    Double calculateAvgResponseTime(@Param("providerName") String providerName, @Param("since") ZonedDateTime since);

    @Modifying
    @Query("DELETE FROM RoutingLog r WHERE r.createdAt < :date")
    void deleteByCreatedAtBefore(@Param("date") ZonedDateTime date);
}
