package com.aura.workspace.controller;

import com.aura.workspace.dto.ApiKeyDto;
import com.aura.workspace.dto.CreateApiKeyResponse;
import com.aura.workspace.service.ApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/api-keys")
@Tag(name = "API Keys", description = "Developer API Key management")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @PostMapping
    @Operation(summary = "Create a new API Key")
    public ResponseEntity<CreateApiKeyResponse> createApiKey(
            @RequestParam UUID workspaceId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails user) {
        
        // Use user details to find user ID - simplified for brevity
        UUID userId = UUID.fromString(user.getUsername()); // Assuming username is ID for this context
        
        String name = (String) request.get("name");
        List<String> scopes = (List<String>) request.get("scopes");
        String expiresAtStr = (String) request.get("expiresAt");
        ZonedDateTime expiresAt = expiresAtStr != null ? ZonedDateTime.parse(expiresAtStr) : null;

        return ResponseEntity.ok(apiKeyService.createApiKey(workspaceId, userId, name, scopes, expiresAt));
    }

    @GetMapping
    @Operation(summary = "List API Keys for a workspace")
    public ResponseEntity<List<ApiKeyDto>> listApiKeys(@RequestParam UUID workspaceId) {
        return ResponseEntity.ok(apiKeyService.listApiKeys(workspaceId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke an API Key")
    public ResponseEntity<Void> revokeApiKey(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        UUID userId = UUID.fromString(user.getUsername());
        apiKeyService.revokeApiKey(id, userId);
        return ResponseEntity.noContent().build();
    }
}
