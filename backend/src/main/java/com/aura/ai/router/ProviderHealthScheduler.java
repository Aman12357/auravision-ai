package com.aura.ai.router;

import com.aura.ai.provider.VideoGenerationProvider;
import com.aura.ai.provider.HealthCheckResult;
import com.aura.ai.repository.AiProviderRepository;
import com.aura.ai.repository.RoutingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class ProviderHealthScheduler {

    private final ProviderRegistry providerRegistry;
    private final AiProviderRepository aiProviderRepository;
    private final RoutingLogRepository routingLogRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void healthCheckAllProviders() {
        log.info("Starting health check for all providers");
        for (VideoGenerationProvider provider : providerRegistry.getAllProviders()) {
            try {
                HealthCheckResult result = provider.healthCheck();
                providerRegistry.updateHealthCheck(provider.getName(), result);
                
                aiProviderRepository.findByName(provider.getName()).ifPresent(entity -> {
                    boolean wasAvailable = entity.isAvailable();
                    entity.setAvailable(result.healthy());
                    entity.setHealthStatus(result.status());
                    entity.setLastHealthCheck(ZonedDateTime.now());
                    aiProviderRepository.save(entity);
                    
                    if (wasAvailable && !result.healthy()) {
                        log.warn("Provider {} went down. Reason: {}", provider.getName(), result.message());
                    } else if (!wasAvailable && result.healthy()) {
                        log.info("Provider {} came back online.", provider.getName());
                    }
                });
                
                try {
                    String redisKey = "provider_health:" + provider.getName();
                    redisTemplate.opsForValue().set(redisKey, result, Duration.ofMinutes(6));
                } catch (Exception re) {
                    log.debug("Redis not available for provider health status cache: {}", re.getMessage());
                }
                
            } catch (Exception e) {
                log.error("Failed to health check provider {}", provider.getName(), e);
            }
        }
    }

    @Scheduled(fixedRate = 3600000) // Every 1 hour
    public void refreshProviderStats() {
        log.info("Refreshing provider stats from routing logs");
        for (VideoGenerationProvider provider : providerRegistry.getAllProviders()) {
            ZonedDateTime oneDayAgo = ZonedDateTime.now().minusDays(1);
            Double successRate = routingLogRepository.calculateSuccessRate(provider.getName(), oneDayAgo);
            Double avgResponseMs = routingLogRepository.calculateAvgResponseTime(provider.getName(), oneDayAgo);
            
            if (successRate == null) successRate = 1.0; // default 100%
            if (avgResponseMs == null) avgResponseMs = 0.0;
            
            double finalRate = successRate;
            aiProviderRepository.findByName(provider.getName()).ifPresent(entity -> {
                entity.setSuccessRate(java.math.BigDecimal.valueOf(finalRate));
                aiProviderRepository.save(entity);
            });
            
            try {
                String redisKey = "provider_stats:" + provider.getName();
                redisTemplate.opsForHash().put(redisKey, "successRate", successRate);
                redisTemplate.opsForHash().put(redisKey, "avgResponseMs", avgResponseMs);
            } catch (Exception re) {
                log.debug("Redis not available for provider stats cache: {}", re.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2am
    public void cleanupOldRoutingLogs() {
        log.info("Cleaning up old routing logs");
        ZonedDateTime thirtyDaysAgo = ZonedDateTime.now().minusDays(30);
        routingLogRepository.deleteByCreatedAtBefore(thirtyDaysAgo);
    }
}
