package com.aura.payment.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "plans")
@Getter
@Setter
public class Plan extends BaseEntity {

    @Column(length = 50, nullable = false)
    private String name;

    @Column(length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal priceMonthly;
    private BigDecimal priceYearly;

    @Column(length = 3)
    private String currency = "USD";

    private Integer creditsMonthly;

    @Column(length = 20)
    private String maxResolution;

    private Integer maxDurationSeconds;
    private Integer maxTeamMembers;
    private Integer storageGb;

    @Column(columnDefinition = "jsonb")
    private String features;

    @Column(length = 255)
    private String stripeMonthlyPriceId;

    @Column(length = 255)
    private String stripeYearlyPriceId;

    @Column(length = 255)
    private String razorpayMonthlyPlanId;

    @Column(length = 255)
    private String razorpayYearlyPlanId;

    @Column(length = 255)
    private String paypalMonthlyPlanId;

    @Column(length = 255)
    private String paypalYearlyPlanId;

    private Integer trialDays = 0;

    private boolean isActive = true;
    private int sortOrder;
}
