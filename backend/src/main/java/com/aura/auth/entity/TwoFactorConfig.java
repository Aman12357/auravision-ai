package com.aura.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "two_factor_configs")
public class TwoFactorConfig {

    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private String secret; // AES-encrypted TOTP secret

    @Column(columnDefinition = "TEXT")
    private String backupCodes; // JSON array of hashed backup codes

    private boolean enabled = false;
    
    private ZonedDateTime verifiedAt;

    @Column(nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public TwoFactorConfig() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public String getBackupCodes() { return backupCodes; }
    public void setBackupCodes(String backupCodes) { this.backupCodes = backupCodes; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public ZonedDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(ZonedDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
