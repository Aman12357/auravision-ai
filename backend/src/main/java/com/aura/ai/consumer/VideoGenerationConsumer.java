package com.aura.ai.consumer;

import com.aura.ai.dto.VideoGenerationRequest;
import com.aura.ai.dto.VideoJobEvent;
import com.aura.video.entity.JobStatus;
import com.aura.video.entity.VideoJob;
import com.aura.ai.provider.GenerationResult;
import com.aura.ai.provider.GenerationStatus;
import com.aura.ai.provider.ProviderException;
import com.aura.ai.provider.VideoGenerationProvider;
import com.aura.video.repository.VideoJobRepository;
import com.aura.ai.router.AIRouter;
import com.aura.ai.router.RoutingStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class VideoGenerationConsumer {

    private final VideoJobRepository videoJobRepository;
    private final AIRouter aiRouter;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(
        topics = "VIDEO_GENERATION_REQUESTED",
        groupId = "ai-generation-worker",
        concurrency = "${kafka.consumer.generation.concurrency:5}"
    )
    @Retryable(
        value = { ProviderException.class },
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2.0)
    )
    public void processVideoGenerationRequest(VideoJobEvent event) {
        log.info("Received video generation request for job: {}", event.getJobId());
        
        Optional<VideoJob> optionalJob = videoJobRepository.findById(event.getJobId());
        if (optionalJob.isEmpty()) {
            log.error("Job not found: {}", event.getJobId());
            return;
        }
        
        VideoJob job = optionalJob.get();
        if (job.getStatus() == JobStatus.PROCESSING || job.getStatus() == JobStatus.COMPLETED) {
            log.info("Job {} is already processing or completed. Skipping.", job.getId());
            return;
        }

        RoutingStrategy strategy = RoutingStrategy.valueOf(job.getRoutingStrategy() != null ? job.getRoutingStrategy() : "AUTO");
        
        VideoGenerationRequest request = VideoGenerationRequest.builder()
            .jobId(job.getId())
            .prompt(job.getPrompt())
            .negativePrompt(job.getNegativePrompt())
            .durationSeconds(job.getDurationSeconds())
            .resolution(job.getResolution())
            .aspectRatio(job.getAspectRatio())
            .build();

        VideoGenerationProvider provider;
        try {
            provider = aiRouter.selectProvider(request, strategy, job.getPreferredProvider());
        } catch (Exception e) {
            log.error("Failed to route job {}", job.getId(), e);
            failJob(job, "Routing failed: " + e.getMessage());
            return;
        }

        job.setStatus(JobStatus.PROCESSING);
        job.setProviderUsed(provider.getName());
        job.setStartedAt(ZonedDateTime.now());
        videoJobRepository.save(job);

        try {
            GenerationResult result = provider.generateVideo(request);
            
            if (result.status() == GenerationStatus.COMPLETED) {
                completeJob(job, result);
            } else if (result.status() == GenerationStatus.PENDING || result.status() == GenerationStatus.PROCESSING) {
                job.setProviderJobId(result.providerJobId());
                videoJobRepository.save(job);
                pollJobStatus(job, provider);
            } else if (result.status() == GenerationStatus.FAILED) {
                failJob(job, result.errorMessage());
            }
        } catch (ProviderException e) {
            log.error("Provider exception for job {}", job.getId(), e);
            if (!e.isRetryable()) {
                failJob(job, e.getMessage());
            } else {
                throw e; // Let @Retryable handle it
            }
        } catch (Exception e) {
            log.error("Unknown error processing job {}", job.getId(), e);
            failJob(job, "Unknown error: " + e.getMessage());
        }
    }

    private void pollJobStatus(VideoJob job, VideoGenerationProvider provider) {
        long maxWaitTime = 10 * 60 * 1000; // 10 minutes
        long pollInterval = 10000; // 10 seconds
        long startTime = System.currentTimeMillis();

        while (System.currentTimeMillis() - startTime < maxWaitTime) {
            try {
                Thread.sleep(pollInterval);
                GenerationStatus status = provider.checkStatus(job.getProviderJobId());
                
                if (status == GenerationStatus.COMPLETED) {
                    GenerationResult finalResult = new GenerationResult(
                        job.getProviderJobId(), status, "/api/v1/renders/" + job.getProviderJobId() + ".mp4", null, job.getDurationSeconds(), job.getResolution(), null, null, 0
                    );
                    completeJob(job, finalResult);
                    return;
                } else if (status == GenerationStatus.FAILED) {
                    failJob(job, "Provider reported failure during polling");
                    return;
                }
                
                job.setProgressPercent(job.getProgressPercent() + 5); 
                videoJobRepository.save(job);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                failJob(job, "Polling interrupted");
                return;
            } catch (ProviderException e) {
                log.warn("Error polling status for job {}: {}", job.getId(), e.getMessage());
            }
        }
        
        failJob(job, "Polling timeout exceeded");
    }

    private void completeJob(VideoJob job, GenerationResult result) {
        job.setStatus(JobStatus.COMPLETED);
        job.setVideoUrl(result.videoUrl());
        job.setCompletedAt(ZonedDateTime.now());
        videoJobRepository.save(job);
        
        kafkaTemplate.send("VIDEO_GENERATION_COMPLETED", new VideoJobEvent(job.getId()));
    }

    private void failJob(VideoJob job, String errorMessage) {
        job.setStatus(JobStatus.FAILED);
        job.setErrorMessage(errorMessage);
        job.setCompletedAt(ZonedDateTime.now());
        videoJobRepository.save(job);
        
        kafkaTemplate.send("VIDEO_GENERATION_FAILED", new VideoJobEvent(job.getId()));
    }

    @KafkaListener(topics = "VIDEO_GENERATION_COMPLETED", groupId = "notification-worker")
    public void handleJobCompleted(VideoJobEvent event) {
        log.info("Handling completion for job: {}", event.getJobId());
        // Send notification to user via NotificationService
        // Update workspace storage usage
        // Update credit transaction with actual cost
    }

    @KafkaListener(topics = "VIDEO_GENERATION_FAILED", groupId = "notification-worker")
    public void handleJobFailed(VideoJobEvent event) {
        log.info("Handling failure for job: {}", event.getJobId());
        // Send failure notification to user
        // Refund estimated credits
    }
}
