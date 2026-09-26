package com.aura.workspace.repository;

import com.aura.workspace.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    
    Optional<ApiKey> findByKeyHash(String keyHash);
    
    List<ApiKey> findByWorkspaceId(UUID workspaceId);

    @Modifying
    @Transactional
    @Query("UPDATE ApiKey k SET k.lastUsedAt = :timestamp WHERE k.id = :id")
    void updateLastUsedAt(UUID id, ZonedDateTime timestamp);
}
