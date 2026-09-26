package com.aura.payment.service;

import com.aura.payment.dto.CheckoutSessionDto;
import com.aura.payment.dto.CreateCheckoutRequest;
import com.aura.payment.dto.PlanDto;
import com.aura.payment.dto.SubscriptionDto;
import com.aura.payment.entity.Plan;
import com.aura.payment.entity.Subscription;
import com.aura.payment.repository.PlanRepository;
import com.aura.payment.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public List<PlanDto> getAllPlans() {
        return planRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(PlanDto::fromPlan)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlanDto getPlan(UUID planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        return PlanDto.fromPlan(plan);
    }

    @Transactional(readOnly = true)
    public SubscriptionDto getCurrentSubscription(UUID workspaceId) {
        Optional<Subscription> sub = subscriptionRepository.findByWorkspaceIdAndStatus(workspaceId, "ACTIVE");
        return sub.map(SubscriptionDto::fromSubscription).orElse(null);
    }

    @Transactional
    public CheckoutSessionDto createCheckoutSession(UUID workspaceId, UUID userId, CreateCheckoutRequest request) {
        Plan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Stub implementation for checkout session creation
        String sessionId = "sess_" + UUID.randomUUID().toString();
        String url = request.successUrl() != null ? request.successUrl() : "https://aura.ai/billing";
        BigDecimal amount = "YEARLY".equalsIgnoreCase(request.billingCycle()) ? plan.getPriceYearly() : plan.getPriceMonthly();
        
        log.info("Creating checkout session for user {} workspace {} plan {}", userId, workspaceId, plan.getName());

        return new CheckoutSessionDto(
                sessionId,
                url,
                request.paymentProvider(),
                amount,
                plan.getCurrency(),
                plan.getDisplayName()
        );
    }

    @Transactional
    public void cancelSubscription(UUID subscriptionId, UUID userId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        // Call provider API to cancel
        subscription.setCancelAtPeriodEnd(true);
        subscriptionRepository.save(subscription);
        log.info("Cancelled subscription {} for user {}", subscriptionId, userId);
    }

    @Transactional
    public void handleStripeWebhook(String payload, String signature) {
        // Stub implementation for Stripe webhook handling
        log.info("Handling stripe webhook: payload size = {}", payload.length());
    }
}
