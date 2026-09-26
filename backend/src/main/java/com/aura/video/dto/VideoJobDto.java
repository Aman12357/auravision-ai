package com.aura.video.dto;
import com.aura.video.entity.JobStatus;
import com.aura.video.entity.JobType;
import com.aura.video.entity.VideoJob;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record VideoJobDto(
    UUID id, JobType jobType, JobStatus status, Integer progressPercent,
    String providerUsed, Integer estimatedCostCredits, Integer actualCostCredits,
    String errorMessage, Integer retryCount, ZonedDateTime queuedAt,
    ZonedDateTime startedAt, ZonedDateTime completedAt, List<VideoAssetDto> assets,
    UUID projectId, UUID workspaceId
) {
    public static VideoJobDto fromJob(VideoJob job) {
        return new VideoJobDto(
            job.getId(), job.getJobType(), job.getStatus(), job.getProgressPercent(),
            job.getProviderUsed(), job.getEstimatedCostCredits(), job.getActualCostCredits(),
            job.getErrorMessage(), job.getRetryCount(), job.getQueuedAt(),
            job.getStartedAt(), job.getCompletedAt(),
            job.getAssets() != null ? job.getAssets().stream().map(VideoAssetDto::fromAsset).collect(Collectors.toList()) : null,
            job.getProject() != null ? job.getProject().getId() : null,
            job.getWorkspace() != null ? job.getWorkspace().getId() : null
        );
    }
}
