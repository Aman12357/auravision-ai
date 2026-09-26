package com.aura.ai.router;

import com.aura.ai.provider.VideoGenerationProvider;
import org.springframework.lang.NonNull;

public record ProviderScore(
    VideoGenerationProvider provider,
    double score,
    String reason
) implements Comparable<ProviderScore> {
    @Override
    public int compareTo(@NonNull ProviderScore other) {
        return Double.compare(other.score, this.score); // Descending order
    }
}
