package com.aura.payment.dto;

import com.aura.payment.entity.Subscription;

import java.time.ZonedDateTime;
import java.util.UUID;

public record SubscriptionDto(
        UUID id,
        UUID planId,
        String planName,
        String status,
        String billingCycle,
        ZonedDateTime currentPeriodStart,
        ZonedDateTime currentPeriodEnd,
        boolean cancelAtPeriodEnd,
        ZonedDateTime trialEnd
) {
    public static SubscriptionDto fromSubscription(Subscription s) {
        return new SubscriptionDto(
                s.getId(),
                s.getPlan().getId(),
                s.getPlan().getName(),
                s.getStatus(),
                s.getBillingCycle(),
                s.getCurrentPeriodStart(),
                s.getCurrentPeriodEnd(),
                s.isCancelAtPeriodEnd(),
                s.getTrialEnd()
        );
    }
}
