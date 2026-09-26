package com.aura.ai.repository;

import com.aura.ai.entity.AiProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiProviderRepository extends JpaRepository<AiProvider, UUID> {
    Optional<AiProvider> findByName(String name);
    List<AiProvider> findByIsEnabledTrue();
    List<AiProvider> findByIsEnabledTrueAndIsAvailableTrue();

    @Modifying
    @Query("UPDATE AiProvider a SET a.isAvailable = :isAvailable, a.healthStatus = :healthStatus, a.lastHealthCheck = :lastHealthCheck WHERE a.name = :name")
    void updateHealthStatus(
            @Param("name") String name,
            @Param("isAvailable") boolean isAvailable,
            @Param("healthStatus") String healthStatus,
            @Param("lastHealthCheck") ZonedDateTime lastHealthCheck
    );
}
