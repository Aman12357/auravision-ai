package com.aura.ai.router;

import com.aura.ai.provider.VideoGenerationProvider;
import com.aura.ai.provider.HealthCheckResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderRegistry {
    private final List<VideoGenerationProvider> providers;
    private final Map<String, HealthCheckResult> lastHealthChecks = new ConcurrentHashMap<>();

    public List<VideoGenerationProvider> getAllProviders() {
        return providers;
    }

    public VideoGenerationProvider getProvider(String name) {
        return providers.stream()
            .filter(p -> p.getName().equalsIgnoreCase(name))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Provider not found: " + name));
    }

    public List<VideoGenerationProvider> getAvailableProviders() {
        return providers.stream()
            .filter(VideoGenerationProvider::isAvailable)
            .collect(Collectors.toList());
    }

    public void markProviderUnavailable(String name, String reason) {
        // Since providers are injected beans, we'd typically update a shared state or DB.
        // Assuming provider implementation checks some external state or we update DB here.
    }

    public void markProviderAvailable(String name) {
    }

    public Map<String, HealthCheckResult> getLastHealthCheckResults() {
        return lastHealthChecks;
    }
    
    public void updateHealthCheck(String name, HealthCheckResult result) {
        lastHealthChecks.put(name, result);
    }
}
