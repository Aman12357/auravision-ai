package com.aura.workspace.dto;

public record CreateApiKeyResponse(
        String apiKey,
        ApiKeyDto keyDto
) {}
