package com.aura.video.event;
import com.aura.video.entity.JobStatus;
import com.aura.video.entity.JobType;
import java.util.UUID;

public record VideoJobEvent(
    UUID jobId, UUID userId, UUID workspaceId, JobType jobType, JobStatus status, String inputData
) {}
