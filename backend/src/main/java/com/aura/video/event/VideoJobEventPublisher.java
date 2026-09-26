package com.aura.video.event;
import com.aura.video.entity.VideoJob;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class VideoJobEventPublisher {
    private final KafkaTemplate<String, VideoJobEvent> kafkaTemplate;

    public void publishJobRequested(VideoJob job) {
        kafkaTemplate.send("VIDEO_GENERATION_REQUESTED", createEvent(job));
    }

    public void publishJobCompleted(VideoJob job) {
        kafkaTemplate.send("VIDEO_GENERATION_COMPLETED", createEvent(job));
    }

    public void publishJobFailed(VideoJob job) {
        kafkaTemplate.send("VIDEO_GENERATION_FAILED", createEvent(job));
    }

    private VideoJobEvent createEvent(VideoJob job) {
        return new VideoJobEvent(
            job.getId(),
            job.getUser() != null ? job.getUser().getId() : null,
            job.getWorkspace() != null ? job.getWorkspace().getId() : null,
            job.getJobType(),
            job.getStatus(),
            job.getInputData()
        );
    }
}
