import os

base_path = r'C:\Users\ay670\.gemini\antigravity\scratch\aura-video-ai\backend\src\main\java\com\aura'

files = {
    # VIDEO DTOs
    'video/dto/CreateProjectRequest.java': '''package com.aura.video.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateProjectRequest(
    @NotBlank @Size(max = 200) String name,
    String description,
    List<String> tags
) {}
''',
    'video/dto/UpdateProjectRequest.java': '''package com.aura.video.dto;
import com.aura.video.entity.ProjectStatus;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProjectRequest(
    @Size(max = 200) String name,
    String description,
    ProjectStatus status,
    List<String> tags
) {}
''',
    'video/dto/ProjectDto.java': '''package com.aura.video.dto;
import com.aura.video.entity.Project;
import com.aura.video.entity.ProjectStatus;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record ProjectDto(
    UUID id, String name, String description, ProjectStatus status,
    String thumbnailUrl, List<String> tags, UUID workspaceId, UUID userId,
    long jobCount, ZonedDateTime createdAt, ZonedDateTime updatedAt
) {
    public static ProjectDto fromProject(Project p, long jobCount) {
        return new ProjectDto(
            p.getId(), p.getName(), p.getDescription(), p.getStatus(),
            p.getThumbnailUrl(), p.getTags(), 
            p.getWorkspace() != null ? p.getWorkspace().getId() : null,
            p.getUser() != null ? p.getUser().getId() : null,
            jobCount, p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
''',
    'video/dto/VideoGenerationRequest.java': '''package com.aura.video.dto;
import com.aura.video.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VideoGenerationRequest(
    @NotBlank String prompt,
    String negativePrompt,
    @NotNull JobType jobType,
    Integer duration,
    Integer fps,
    String resolution,
    String aspectRatio,
    String cameraMotion,
    String lighting,
    String colorPalette,
    String style,
    String mood,
    String environment,
    String weather,
    Long seed,
    String referenceImageUrl,
    String referenceVideoUrl,
    UUID projectId,
    UUID sceneId,
    String preferredProvider,
    Boolean filmGrain,
    Boolean motionBlur,
    Boolean depthOfField
) {}
''',
    'video/dto/VideoJobDto.java': '''package com.aura.video.dto;
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
''',
    'video/dto/VideoAssetDto.java': '''package com.aura.video.dto;
import com.aura.video.entity.AssetType;
import com.aura.video.entity.VideoAsset;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record VideoAssetDto(
    UUID id, AssetType assetType, String cdnUrl, String storageKey,
    Long fileSizeBytes, BigDecimal durationSeconds, String resolution,
    String format, Integer downloadCount, ZonedDateTime createdAt
) {
    public static VideoAssetDto fromAsset(VideoAsset asset) {
        return new VideoAssetDto(
            asset.getId(), asset.getAssetType(), asset.getCdnUrl(), asset.getStorageKey(),
            asset.getFileSizeBytes(), asset.getDurationSeconds(), asset.getResolution(),
            asset.getFormat(), asset.getDownloadCount(), asset.getCreatedAt()
        );
    }
}
''',
    'video/dto/CreateStoryboardRequest.java': '''package com.aura.video.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateStoryboardRequest(
    @NotNull UUID projectId,
    @NotBlank String title,
    String description,
    List<CreateSceneRequest> scenes
) {}
''',
    'video/dto/CreateSceneRequest.java': '''package com.aura.video.dto;
import jakarta.validation.constraints.NotBlank;

public record CreateSceneRequest(
    Integer sceneIndex,
    String title,
    @NotBlank String prompt,
    String negativePrompt,
    Integer duration,
    Integer fps,
    String resolution,
    String aspectRatio,
    String cameraMotion,
    String lighting,
    String style,
    String mood,
    String environment,
    String weather,
    Long seed
) {}
''',
    'video/dto/StoryboardDto.java': '''package com.aura.video.dto;
import com.aura.video.entity.Storyboard;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record StoryboardDto(
    UUID id, UUID projectId, String title, String description,
    Integer totalDuration, String status, List<SceneDto> scenes, ZonedDateTime createdAt
) {
    public static StoryboardDto fromStoryboard(Storyboard s) {
        return new StoryboardDto(
            s.getId(),
            s.getProject() != null ? s.getProject().getId() : null,
            s.getTitle(), s.getDescription(), s.getTotalDuration(), s.getStatus(),
            s.getScenes() != null ? s.getScenes().stream().map(SceneDto::fromScene).collect(Collectors.toList()) : null,
            s.getCreatedAt()
        );
    }
}
''',
    'video/dto/SceneDto.java': '''package com.aura.video.dto;
import com.aura.video.entity.Scene;
import java.time.ZonedDateTime;
import java.util.UUID;

public record SceneDto(
    UUID id, Integer sceneIndex, String title, String prompt, String negativePrompt,
    Integer duration, Integer fps, String resolution, String aspectRatio,
    String cameraMotion, String style, String mood, String status, ZonedDateTime createdAt
) {
    public static SceneDto fromScene(Scene s) {
        return new SceneDto(
            s.getId(), s.getSceneIndex(), s.getTitle(), s.getPrompt(), s.getNegativePrompt(),
            s.getDuration(), s.getFps(), s.getResolution(), s.getAspectRatio(),
            s.getCameraMotion(), s.getStyle(), s.getMood(), s.getStatus(), s.getCreatedAt()
        );
    }
}
''',
    'video/dto/DashboardStatsDto.java': '''package com.aura.video.dto;

public record DashboardStatsDto(
    long totalProjects,
    long totalVideosGenerated,
    long creditsUsedThisMonth,
    long creditsBalance,
    long activeJobs,
    long completedJobs,
    long storageUsedBytes,
    String storageUsedFormatted
) {}
''',
    # VIDEO EVENT
    'video/event/VideoJobEvent.java': '''package com.aura.video.event;
import com.aura.video.entity.JobStatus;
import com.aura.video.entity.JobType;
import java.util.UUID;

public record VideoJobEvent(
    UUID jobId, UUID userId, UUID workspaceId, JobType jobType, JobStatus status, String inputData
) {}
''',
    'video/event/VideoJobEventPublisher.java': '''package com.aura.video.event;
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
''',
    # VIDEO SERVICES
    'video/service/ProjectService.java': '''package com.aura.video.service;

import com.aura.video.dto.*;
import com.aura.video.entity.Project;
import com.aura.video.entity.ProjectStatus;
import com.aura.video.repository.ProjectRepository;
import com.aura.video.repository.VideoJobRepository;
import com.aura.video.repository.VideoAssetRepository;
import com.aura.workspace.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final VideoJobRepository videoJobRepository;
    private final VideoAssetRepository videoAssetRepository;
    private final CreditService creditService;

    public ProjectDto createProject(UUID workspaceId, UUID userId, CreateProjectRequest request) {
        Project project = Project.builder()
                // would set proxy references for workspace and user here normally
                .name(request.name())
                .description(request.description())
                .tags(request.tags())
                .status(ProjectStatus.DRAFT)
                .build();
        Project saved = projectRepository.save(project);
        return ProjectDto.fromProject(saved, 0);
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        return ProjectDto.fromProject(project, project.getJobs() != null ? project.getJobs().size() : 0);
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> getProjectsByWorkspace(UUID workspaceId, UUID userId, Pageable pageable) {
        return projectRepository.findByWorkspaceId(workspaceId, pageable)
                .map(p -> ProjectDto.fromProject(p, p.getJobs() != null ? p.getJobs().size() : 0));
    }

    public ProjectDto updateProject(UUID projectId, UUID userId, UpdateProjectRequest request) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        if (request.name() != null) project.setName(request.name());
        if (request.description() != null) project.setDescription(request.description());
        if (request.status() != null) project.setStatus(request.status());
        if (request.tags() != null) project.setTags(request.tags());
        return ProjectDto.fromProject(projectRepository.save(project), project.getJobs() != null ? project.getJobs().size() : 0);
    }

    public void deleteProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        project.setStatus(ProjectStatus.ARCHIVED);
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(UUID workspaceId, UUID userId) {
        long totalProjects = projectRepository.countByWorkspaceId(workspaceId);
        long activeJobs = videoJobRepository.countByWorkspaceIdAndStatus(workspaceId, com.aura.video.entity.JobStatus.PROCESSING);
        long completedJobs = videoJobRepository.countByWorkspaceIdAndStatus(workspaceId, com.aura.video.entity.JobStatus.COMPLETED);
        
        ZonedDateTime startOfMonth = ZonedDateTime.now().with(TemporalAdjusters.firstDayOfMonth());
        Long creditsUsedThisMonth = videoJobRepository.sumCreditsByWorkspaceSince(workspaceId, startOfMonth);
        long creditsUsed = creditsUsedThisMonth != null ? creditsUsedThisMonth : 0;
        
        long creditsBalance = creditService.getBalance(workspaceId);
        
        Long storageUsedBytes = videoAssetRepository.sumFileSizeBytesByWorkspaceId(workspaceId);
        long storageBytes = storageUsedBytes != null ? storageUsedBytes : 0;
        String storageUsedFormatted = formatStorage(storageBytes);
        
        return new DashboardStatsDto(totalProjects, completedJobs, creditsUsed, creditsBalance, activeJobs, completedJobs, storageBytes, storageUsedFormatted);
    }

    @Transactional(readOnly = true)
    public List<VideoJobDto> getRecentJobs(UUID workspaceId, int limit) {
        return videoJobRepository.findByWorkspaceId(workspaceId, Pageable.ofSize(limit))
                .stream().map(VideoJobDto::fromJob).collect(Collectors.toList());
    }
    
    private String formatStorage(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
''',
    'video/service/VideoJobService.java': '''package com.aura.video.service;

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
                .inputData("{"prompt":"" + request.prompt() + ""}") // Simple JSON representation
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
''',
    'video/service/StoryboardService.java': '''package com.aura.video.service;

import com.aura.video.dto.CreateSceneRequest;
import com.aura.video.dto.CreateStoryboardRequest;
import com.aura.video.dto.SceneDto;
import com.aura.video.dto.StoryboardDto;
import com.aura.video.entity.Scene;
import com.aura.video.entity.Storyboard;
import com.aura.video.repository.SceneRepository;
import com.aura.video.repository.StoryboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryboardService {
    private final StoryboardRepository storyboardRepository;
    private final SceneRepository sceneRepository;

    public StoryboardDto createStoryboard(CreateStoryboardRequest request, UUID userId) {
        Storyboard storyboard = Storyboard.builder()
                .title(request.title())
                .description(request.description())
                .status("DRAFT")
                .build();
        
        Storyboard saved = storyboardRepository.save(storyboard);
        
        if (request.scenes() != null) {
            var scenes = request.scenes().stream().map(s -> Scene.builder()
                    .storyboard(saved)
                    .sceneIndex(s.sceneIndex())
                    .title(s.title())
                    .prompt(s.prompt())
                    .negativePrompt(s.negativePrompt())
                    .duration(s.duration())
                    .fps(s.fps())
                    .resolution(s.resolution())
                    .aspectRatio(s.aspectRatio())
                    .cameraMotion(s.cameraMotion())
                    .lighting(s.lighting())
                    .style(s.style())
                    .mood(s.mood())
                    .environment(s.environment())
                    .weather(s.weather())
                    .seed(s.seed())
                    .status("PENDING")
                    .build()).collect(Collectors.toList());
            sceneRepository.saveAll(scenes);
            saved.setScenes(scenes);
        }
        return StoryboardDto.fromStoryboard(saved);
    }

    @Transactional(readOnly = true)
    public StoryboardDto getStoryboard(UUID storyboardId, UUID userId) {
        return StoryboardDto.fromStoryboard(storyboardRepository.findById(storyboardId).orElseThrow());
    }

    public SceneDto updateScene(UUID sceneId, CreateSceneRequest request, UUID userId) {
        Scene scene = sceneRepository.findById(sceneId).orElseThrow();
        scene.setPrompt(request.prompt());
        scene.setNegativePrompt(request.negativePrompt());
        if (request.duration() != null) scene.setDuration(request.duration());
        if (request.fps() != null) scene.setFps(request.fps());
        // more field updates as needed...
        return SceneDto.fromScene(sceneRepository.save(scene));
    }

    public StoryboardDto generateStoryboardFromPrompt(String prompt, UUID projectId, UUID userId) {
        // Mock OpenAI logic for breaking prompt into scenes
        Storyboard storyboard = Storyboard.builder()
                .title("Generated Storyboard")
                .description(prompt)
                .status("DRAFT")
                .build();
        Storyboard saved = storyboardRepository.save(storyboard);
        
        Scene scene = Scene.builder()
                .storyboard(saved)
                .sceneIndex(1)
                .title("Scene 1")
                .prompt(prompt)
                .duration(5)
                .fps(24)
                .status("PENDING")
                .build();
        sceneRepository.save(scene);
        saved.setScenes(List.of(scene));
        
        return StoryboardDto.fromStoryboard(saved);
    }
}
'''
}

for filepath, content in files.items():
    full_path = os.path.join(base_path, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Created {len(files)} files successfully.")
