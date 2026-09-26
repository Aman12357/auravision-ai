package com.aura.auth.repository;

import com.aura.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findAllByUserId(UUID userId);
    
    void deleteAllByUserId(UUID userId);
    
    void deleteAllByExpiresAtBefore(ZonedDateTime date);
    
    int countByUserIdAndRevokedFalse(UUID userId);
}
