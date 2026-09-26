package com.aura.auth.repository;

import com.aura.auth.entity.OtpCode;
import com.aura.auth.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {
    
    Optional<OtpCode> findByEmailAndPurposeAndUsedFalse(String email, OtpPurpose purpose);
    
    void deleteByEmailAndPurpose(String email, OtpPurpose purpose);
    
    int countByEmailAndCreatedAtAfter(String email, ZonedDateTime since);
}
