package com.aura.video.service;

import com.aura.video.dto.VideoGenerationRequest;
import com.aura.video.dto.VideoJobDto;
import com.aura.video.entity.JobStatus;
import com.aura.video.entity.VideoAsset;
import com.aura.video.entity.VideoJob;
import com.aura.video.event.VideoJobEventPublisher;
import com.aura.video.repository.VideoJobRepository;
import com.aura.workspace.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class VideoJobService {
    private final VideoJobRepository videoJobRepository;
    private final CreditService creditService;
    private final VideoJobEventPublisher eventPublisher;
    
    private final ConcurrentHashMap<UUID, Sinks.Many<VideoJobDto>> userSinks = new ConcurrentHashMap<>();

    public VideoJobDto submitJob(UUID workspaceId, UUID userId, VideoGenerationRequest request) {
        int estimatedCost = creditService.estimateJobCost(request);
        creditService.debitCredits(workspaceId, userId, estimatedCost, "Video Generation Request", null, "JOB_ESTIMATE");
        
        VideoJob job = VideoJob.builder()
                .jobType(request.jobType())
                .status(JobStatus.QUEUED)
                .inputData("{\"prompt\":\"" + request.prompt() + "\"}") // Simple JSON representation
                .estimatedCostCredits(estimatedCost)
                .queuedAt(ZonedDateTime.now())
                .build();
        
        VideoJob saved = videoJobRepository.save(job);
        eventPublisher.publishJobRequested(saved);
        return VideoJobDto.fromJob(saved);
    }

    @Transactional(readOnly = true)
    public VideoJobDto getJob(UUID jobId, UUID userId) {
        return VideoJobDto.fromJob(videoJobRepository.findById(jobId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public Page<VideoJobDto> getJobsByWorkspace(UUID workspaceId, UUID userId, Pageable pageable) {
        return videoJobRepository.findByWorkspaceId(workspaceId, pageable).map(VideoJobDto::fromJob);
    }

    public VideoJobDto cancelJob(UUID jobId, UUID userId) {
        VideoJob job = videoJobRepository.findById(jobId).orElseThrow();
        if (job.getStatus() == JobStatus.QUEUED || job.getStatus() == JobStatus.PROCESSING) {
            job.setStatus(JobStatus.CANCELLED);
            videoJobRepository.save(job);
        }
        return VideoJobDto.fromJob(job);
    }

    public void updateJobStatus(UUID jobId, JobStatus status, int progress, String providerJobId) {
        VideoJob job = videoJobRepository.findById(jobId).orElseThrow();
        job.setStatus(status);
        job.setProgressPercent(progress);
        if (providerJobId != null) job.setProviderJobId(providerJobId);
        if (status == JobStatus.PROCESSING && job.getStartedAt() == null) {
            job.getStartedAt();
        }
        VideoJob saved = videoJobRepository.save(job);
        broadcastUpdate(saved);
    }

    public void completeJob(UUID jobId, List<VideoAsset> assets, int actualCredits) {
        VideoJob job = videoJobRepository.findById(jobId).orElseThrow();
        job.setStatus(JobStatus.COMPLETED);
        job.setProgressPercent(100);
        job.setCompletedAt(ZonedDateTime.now());
        job.setActualCostCredits(actualCredits);
        job.setAssets(assets);
        VideoJob saved = videoJobRepository.save(job);
        eventPublisher.publishJobCompleted(saved);
        broadcastUpdate(saved);
    }

    public void failJob(UUID jobId, String errorMessage) {
        VideoJob job = videoJobRepository.findById(jobId).orElseThrow();
        job.setStatus(JobStatus.FAILED);
        job.setErrorMessage(errorMessage);
        job.setCompletedAt(ZonedDateTime.now());
        VideoJob saved = videoJobRepository.save(job);
        eventPublisher.publishJobFailed(saved);
        broadcastUpdate(saved);
    }

    public Flux<ServerSentEvent<VideoJobDto>> getJobSseStream(UUID userId) {
        Sinks.Many<VideoJobDto> sink = userSinks.computeIfAbsent(userId, id -> Sinks.many().multicast().onBackpressureBuffer());
        return sink.asFlux()
                .map(dto -> ServerSentEvent.<VideoJobDto>builder()
                        .event("job-update")
                        .data(dto)
                        .build());
    }
    
    private void broadcastUpdate(VideoJob job) {
        if (job.getUser() != null) {
            Sinks.Many<VideoJobDto> sink = userSinks.get(job.getUser().getId());
            if (sink != null) {
                sink.tryEmitNext(VideoJobDto.fromJob(job));
            }
        }
    }
}
