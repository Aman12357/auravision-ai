package com.aura.ai.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name="routing_logs")
@Getter
@Setter
public class RoutingLog extends BaseEntity {
    private UUID jobId;
    
    @Column(length = 50)
    private String providerName;
    
    @Column(length = 50)
    private String routingStrategy;
    
    private BigDecimal score;
    private boolean wasSelected;
    private Boolean wasSuccessful;
    private Integer responseTimeMs;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
