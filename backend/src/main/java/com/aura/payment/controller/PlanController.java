package com.aura.payment.controller;

import com.aura.payment.dto.CheckoutSessionDto;
import com.aura.payment.dto.CreateCheckoutRequest;
import com.aura.payment.dto.PlanDto;
import com.aura.payment.dto.SubscriptionDto;
import com.aura.payment.entity.Payment;
import com.aura.payment.repository.PaymentRepository;
import com.aura.payment.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Plans & Billing")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;
    private final PaymentRepository paymentRepository;

    @Operation(summary = "Get all active plans")
    @GetMapping("/plans")
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @Operation(summary = "Get plan by ID")
    @GetMapping("/plans/{id}")
    public ResponseEntity<PlanDto> getPlan(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.getPlan(id));
    }

    @Operation(summary = "Get current subscription for workspace")
    @GetMapping("/subscriptions/current")
    public ResponseEntity<SubscriptionDto> getCurrentSubscription(@RequestHeader("X-Workspace-Id") UUID workspaceId) {
        SubscriptionDto sub = planService.getCurrentSubscription(workspaceId);
        return sub != null ? ResponseEntity.ok(sub) : ResponseEntity.noContent().build();
    }

    @Operation(summary = "Create checkout session")
    @PostMapping("/subscriptions/checkout")
    public ResponseEntity<CheckoutSessionDto> createCheckoutSession(
            @RequestHeader("X-Workspace-Id") UUID workspaceId,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateCheckoutRequest request) {
        return ResponseEntity.ok(planService.createCheckoutSession(workspaceId, userId, request));
    }

    @Operation(summary = "Cancel subscription")
    @DeleteMapping("/subscriptions/{id}")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        planService.cancelSubscription(id, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Stripe webhook")
    @PostMapping("/webhooks/stripe")
    public ResponseEntity<Void> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        planService.handleStripeWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get payment history")
    @GetMapping("/payments")
    public ResponseEntity<Page<Payment>> getPaymentHistory(
            @RequestHeader("X-Workspace-Id") UUID workspaceId,
            Pageable pageable) {
        return ResponseEntity.ok(paymentRepository.findByWorkspaceId(workspaceId, pageable));
    }
}
