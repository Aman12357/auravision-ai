package com.aura.ai.router;

import com.aura.ai.dto.VideoGenerationRequest;
import com.aura.ai.entity.RoutingLog;
import com.aura.ai.provider.VideoGenerationProvider;
import com.aura.ai.repository.RoutingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIRouter {

    private final List<VideoGenerationProvider> providers;
    private final RoutingLogRepository routingLogRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public VideoGenerationProvider selectProvider(
            VideoGenerationRequest request,
            RoutingStrategy strategy,
            String preferredProvider) {

        // Check Cinematic Realism Fallback Chain
        if (isCinematicRealismRequired(request.getPrompt())) {
            log.info("Cinematic realism detected in prompt. Executing Cascading Provider Fallback Chain (Kling/Veo -> Luma/Vidu -> Wan/LTX/Local)...");
            VideoGenerationProvider cascadingProvider = selectCascadingProvider(request);
            if (cascadingProvider != null) {
                logRoutingDecision(request.getJobId(), Collections.emptyList(), cascadingProvider, strategy);
                return cascadingProvider;
            }
        }

        if (RoutingStrategy.SPECIFIC_PROVIDER.equals(strategy) && preferredProvider != null) {
            VideoGenerationProvider provider = providers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(preferredProvider))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Preferred provider not found: " + preferredProvider));
                
            if (provider.isAvailable() && provider.supports(request)) {
                logRoutingDecision(request.getJobId(), Collections.emptyList(), provider, strategy);
                return provider;
            } else {
                throw new RuntimeException("Preferred provider is unavailable or does not support request");
            }
        }

        List<ProviderScore> scores = scoreAllProviders(request, strategy);
        
        if (scores.isEmpty()) {
            throw new RuntimeException("AI_001: No suitable AI provider available for this request");
        }
        
        VideoGenerationProvider selected = scores.get(0).provider();
        logRoutingDecision(request.getJobId(), scores, selected, strategy);
        return selected;
    }

    public boolean isCinematicRealismRequired(String prompt) {
        if (prompt == null) return false;
        String p = prompt.toLowerCase();
        return p.contains("cinematic") || p.contains("realistic") || p.contains("3d") || p.contains("photorealistic") || p.contains("4k");
    }

    public VideoGenerationProvider selectCascadingProvider(VideoGenerationRequest request) {
        // Tier 1: Kling / Veo
        List<String> tier1 = Arrays.asList("KLING_AI", "VEO_AI", "RUNWAY_GEN3");
        for (String name : tier1) {
            Optional<VideoGenerationProvider> match = findAvailableProvider(name, request);
            if (match.isPresent()) return match.get();
        }

        // Tier 2: Luma / Vidu
        List<String> tier2 = Arrays.asList("LUMA_DREAM_MACHINE", "VIDU_AI", "PIKA_LABS");
        for (String name : tier2) {
            Optional<VideoGenerationProvider> match = findAvailableProvider(name, request);
            if (match.isPresent()) return match.get();
        }

        // Tier 3: Wan / LTX / Local Engine
        List<String> tier3 = Arrays.asList("WAN_2.1", "LTX_VIDEO", "LOCAL_AI_ENGINE");
        for (String name : tier3) {
            Optional<VideoGenerationProvider> match = findAvailableProvider(name, request);
            if (match.isPresent()) return match.get();
        }

        return providers.stream().filter(VideoGenerationProvider::isAvailable).findFirst().orElse(null);
    }

    private Optional<VideoGenerationProvider> findAvailableProvider(String name, VideoGenerationRequest request) {
        return providers.stream()
            .filter(p -> p.getName().equalsIgnoreCase(name))
            .filter(VideoGenerationProvider::isAvailable)
            .filter(p -> p.supports(request))
            .findFirst();
    }

    public List<ProviderScore> scoreAllProviders(VideoGenerationRequest request, RoutingStrategy strategy) {
        return providers.stream()
            .filter(VideoGenerationProvider::isAvailable)
            .filter(p -> p.supports(request))
            .map(p -> new ProviderScore(p, calculateScore(p, request, strategy), "Calculated using " + strategy))
            .sorted()
            .collect(Collectors.toList());
    }

    private double calculateScore(VideoGenerationProvider provider, VideoGenerationRequest request, RoutingStrategy strategy) {
        double qualityScore = Math.max(0, 30 - provider.getPriority());
        double costScore = Math.max(0, 25 - (provider.getCostPerSecond() * 2));
        double speedScore = Math.max(0, 25 - (provider.getCapabilities().avgGenerationTimeSeconds() / 10));
        double successRateScore = getSuccessRateFromCache(provider.getName()) * 20;

        double qWeight = 0.30, cWeight = 0.25, sWeight = 0.25, srWeight = 0.20;

        switch (strategy) {
            case LOWEST_COST -> { qWeight = 0.20; cWeight = 0.50; sWeight = 0.15; srWeight = 0.15; }
            case HIGHEST_QUALITY -> { qWeight = 0.50; cWeight = 0.10; sWeight = 0.20; srWeight = 0.20; }
            case FASTEST -> { qWeight = 0.20; cWeight = 0.15; sWeight = 0.50; srWeight = 0.15; }
            case AUTO -> {}
        }

        return (qualityScore * qWeight * 3.33) + 
               (costScore * cWeight * 4.0) + 
               (speedScore * sWeight * 4.0) + 
               (successRateScore * srWeight * 5.0);
    }

    private double getSuccessRateFromCache(String providerName) {
        String key = "provider_stats:" + providerName;
        Object val = redisTemplate.opsForHash().get(key, "successRate");
        if (val instanceof Number n) {
            return n.doubleValue();
        }
        return 1.0; 
    }

    private void logRoutingDecision(UUID jobId, List<ProviderScore> scores, VideoGenerationProvider selected, RoutingStrategy strategy) {
        RoutingLog logEntry = new RoutingLog();
        logEntry.setJobId(jobId);
        logEntry.setProviderName(selected.getName());
        logEntry.setRoutingStrategy(strategy.name());
        logEntry.setWasSelected(true);
        
        scores.stream()
            .filter(s -> s.provider().getName().equals(selected.getName()))
            .findFirst()
            .ifPresent(s -> logEntry.setScore(BigDecimal.valueOf(s.score())));
            
        routingLogRepository.save(logEntry);
        
        log.info("Routed job {} to provider {} with strategy {}", jobId, selected.getName(), strategy);
    }
}
