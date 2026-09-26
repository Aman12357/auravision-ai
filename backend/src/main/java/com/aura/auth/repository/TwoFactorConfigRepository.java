package com.aura.auth.repository;

import com.aura.auth.entity.TwoFactorConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TwoFactorConfigRepository extends JpaRepository<TwoFactorConfig, UUID> {
    
    Optional<TwoFactorConfig> findByUserId(UUID userId);
    
    boolean existsByUserIdAndEnabledTrue(UUID userId);
}
