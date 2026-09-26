package com.aura.payment.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class Subscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(length = 30)
    private String status; // ACTIVE, CANCELLED, PAST_DUE, TRIALING, EXPIRED

    @Column(length = 10)
    private String billingCycle; // MONTHLY, YEARLY

    private ZonedDateTime currentPeriodStart;
    private ZonedDateTime currentPeriodEnd;
    private ZonedDateTime trialEnd;

    private boolean cancelAtPeriodEnd;

    @Column(length = 255)
    private String stripeSubscriptionId;

    @Column(length = 255)
    private String razorpaySubscriptionId;

    @Column(length = 255)
    private String paypalSubscriptionId;

    @Column(length = 20)
    private String paymentProvider;
}
