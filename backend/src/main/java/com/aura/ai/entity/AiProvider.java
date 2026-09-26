package com.aura.ai.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name="ai_providers")
@Getter
@Setter
public class AiProvider extends BaseEntity {
    
    @Column(unique = true, length = 50)
    private String name;
    
    @Column(length = 100)
    private String displayName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String apiEndpoint;
    
    @Column(length = 100)
    private String apiKeyEnvVar;
    
    private boolean isEnabled;
    private boolean isAvailable;
    private int priority;
    
    private BigDecimal costPerSecond;
    private int creditsPerSecond;
    private int maxDurationSeconds;
    
    @ElementCollection
    private List<String> supportedResolutions;
    
    @ElementCollection
    private List<String> supportedAspectRatios;
    
    @Column(columnDefinition="jsonb")
    private String capabilities;
    
    private int rateLimitRpm;
    private int avgGenerationTimeSeconds;
    
    private BigDecimal successRate;
    private ZonedDateTime lastHealthCheck;
    
    @Column(length = 20)
    private String healthStatus;
}
