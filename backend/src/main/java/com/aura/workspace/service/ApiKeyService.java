package com.aura.workspace.service;

import com.aura.user.entity.User;
import com.aura.user.repository.UserRepository;
import com.aura.workspace.dto.ApiKeyDto;
import com.aura.workspace.dto.CreateApiKeyResponse;
import com.aura.workspace.entity.ApiKey;
import com.aura.workspace.entity.Workspace;
import com.aura.workspace.repository.ApiKeyRepository;
import com.aura.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public CreateApiKeyResponse createApiKey(UUID workspaceId, UUID userId, String name, List<String> scopes, ZonedDateTime expiresAt) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        byte[] keyBytes = new byte[32];
        secureRandom.nextBytes(keyBytes);
        String rawKey = "aura_sk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(keyBytes);

        String prefix = rawKey.substring(0, 15); // aura_sk_XXXXXXX
        String hash = hashKey(rawKey);

        ApiKey apiKey = new ApiKey();
        apiKey.setWorkspace(workspace);
        apiKey.setUser(user);
        apiKey.setName(name);
        apiKey.setKeyPrefix(prefix);
        apiKey.setKeyHash(hash);
        apiKey.setScopes(scopes);
        apiKey.setRateLimitRpm(30); // Default, can be adjusted by plan
        apiKey.setExpiresAt(expiresAt);
        apiKey.setActive(true);

        apiKey = apiKeyRepository.save(apiKey);

        ApiKeyDto dto = new ApiKeyDto(
                apiKey.getId(), apiKey.getName(), apiKey.getKeyPrefix(),
                apiKey.getScopes(), apiKey.getRateLimitRpm(), apiKey.isActive(),
                apiKey.getLastUsedAt(), apiKey.getExpiresAt(), apiKey.getCreatedAt()
        );

        return new CreateApiKeyResponse(rawKey, dto);
    }

    public List<ApiKeyDto> listApiKeys(UUID workspaceId) {
        return apiKeyRepository.findByWorkspaceId(workspaceId).stream()
                .map(k -> new ApiKeyDto(
                        k.getId(), k.getName(), k.getKeyPrefix(),
                        k.getScopes(), k.getRateLimitRpm(), k.isActive(),
                        k.getLastUsedAt(), k.getExpiresAt(), k.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeApiKey(UUID keyId, UUID userId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new IllegalArgumentException("Key not found"));
        
        // Simple authorization check
        if (!apiKey.getUser().getId().equals(userId) && !apiKey.getWorkspace().getOwner().getId().equals(userId)) {
            throw new SecurityException("Not authorized to revoke this key");
        }

        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
    }

    public Optional<ApiKey> verifyApiKey(String rawKey) {
        if (rawKey == null || !rawKey.startsWith("aura_sk_")) {
            return Optional.empty();
        }
        String hash = hashKey(rawKey);
        return apiKeyRepository.findByKeyHash(hash);
    }

    private String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 missing", e);
        }
    }
}
