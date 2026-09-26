package com.aura.payment.dto;

import java.math.BigDecimal;

public record CheckoutSessionDto(
        String sessionId,
        String checkoutUrl,
        String provider,
        BigDecimal amount,
        String currency,
        String planName
) {}
