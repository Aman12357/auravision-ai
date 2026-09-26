package com.aura.payment.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    private BigDecimal amount;

    @Column(length = 3)
    private String currency;

    @Column(length = 30)
    private String status; // PENDING, COMPLETED, FAILED, REFUNDED

    @Column(length = 20)
    private String paymentProvider; // STRIPE, RAZORPAY, PAYPAL

    @Column(length = 255)
    private String providerPaymentId;

    @Column(length = 255)
    private String providerChargeId;

    @Column(columnDefinition = "jsonb")
    private String metadata;
}
