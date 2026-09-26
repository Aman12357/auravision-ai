package com.aura.workspace.dto;
import java.time.ZonedDateTime;
import java.util.UUID;

public record CreditTransactionDto(
    UUID id, String type, long amount, long balanceAfter,
    String description, String referenceId, String referenceType, ZonedDateTime createdAt
) {}
