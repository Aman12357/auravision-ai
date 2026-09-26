package com.aura.analytics.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "analytics_events")
@Getter
@Setter
public class AnalyticsEvent extends BaseEntity {

    private UUID workspaceId;
    
    private UUID userId;

    private String sessionId;

    @Column(length = 100, nullable = false)
    private String eventName;

    @Column(length = 50, nullable = false)
    private String eventCategory;

    @Column(columnDefinition = "jsonb")
    private String properties;

    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String referrer;

    @Column(columnDefinition = "TEXT")
    private String pageUrl;
}
