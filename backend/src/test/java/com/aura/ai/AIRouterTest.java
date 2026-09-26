package com.aura.ai;

import com.aura.ai.dto.VideoGenerationRequest;
import com.aura.ai.provider.ProviderCapabilities;
import com.aura.ai.provider.VideoGenerationProvider;
import com.aura.ai.repository.RoutingLogRepository;
import com.aura.ai.router.AIRouter;
import com.aura.ai.router.RoutingStrategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIRouterTest {

    @Mock private RoutingLogRepository routingLogRepository;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private ValueOperations<String, Object> valueOperations;

    @Mock private VideoGenerationProvider localProvider;
    @Mock private VideoGenerationProvider secondaryProvider;

    private AIRouter aiRouter;

    @BeforeEach
    void setUp() {
        when(localProvider.getName()).thenReturn("LOCAL_AI_ENGINE");
        when(localProvider.isAvailable()).thenReturn(true);
        when(localProvider.supports(any())).thenReturn(true);
        when(localProvider.getPriority()).thenReturn(100);
        when(localProvider.getCostPerSecond()).thenReturn(0);

        when(secondaryProvider.getName()).thenReturn("SECONDARY_LOCAL");
        when(secondaryProvider.isAvailable()).thenReturn(true);
        when(secondaryProvider.supports(any())).thenReturn(true);
        when(secondaryProvider.getPriority()).thenReturn(50);
        when(secondaryProvider.getCostPerSecond()).thenReturn(0);

        ProviderCapabilities localCaps = new ProviderCapabilities(
            true, true, true, true, true,
            List.of("1080p", "4K"), List.of("16:9"), 300, 5, 60,
            true, true, true, true, 99.0, 0
        );

        ProviderCapabilities secondaryCaps = new ProviderCapabilities(
            true, true, true, false, false,
            List.of("1080p"), List.of("16:9", "9:16"), 60, 5, 30,
            true, true, true, false, 90.0, 0
        );

        when(localProvider.getCapabilities()).thenReturn(localCaps);
        when(secondaryProvider.getCapabilities()).thenReturn(secondaryCaps);

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.get(anyString())).thenReturn(99.0);

        List<VideoGenerationProvider> providers = List.of(localProvider, secondaryProvider);
        aiRouter = new AIRouter(providers, routingLogRepository, redisTemplate);
    }

    @Test
    @DisplayName("Should route to preferred local provider if available and supported")
    void testPreferredProviderRouting() {
        VideoGenerationRequest request = VideoGenerationRequest.builder()
            .jobId(UUID.randomUUID())
            .prompt("A cinematic dragon flying")
            .durationSeconds(10)
            .resolution("1080p")
            .aspectRatio("16:9")
            .build();

        VideoGenerationProvider selected = aiRouter.selectProvider(request, RoutingStrategy.AUTO, "LOCAL_AI_ENGINE");

        assertNotNull(selected);
        assertEquals("LOCAL_AI_ENGINE", selected.getName());
    }

    @Test
    @DisplayName("Should select local engine under AUTO strategy")
    void testAutoRoutingStrategy() {
        VideoGenerationRequest request = VideoGenerationRequest.builder()
            .jobId(UUID.randomUUID())
            .prompt("A futuristic city")
            .durationSeconds(5)
            .resolution("1080p")
            .aspectRatio("16:9")
            .build();

        VideoGenerationProvider selected = aiRouter.selectProvider(request, RoutingStrategy.AUTO, null);

        assertNotNull(selected);
        assertEquals("LOCAL_AI_ENGINE", selected.getName());
    }
}
