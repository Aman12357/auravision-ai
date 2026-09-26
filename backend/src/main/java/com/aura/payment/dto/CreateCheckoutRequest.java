package com.aura.payment.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateCheckoutRequest(
        @NotNull UUID planId,
        @NotNull String billingCycle, // MONTHLY or YEARLY
        @NotNull String paymentProvider, // STRIPE or RAZORPAY
        String successUrl,
        String cancelUrl
) {}
