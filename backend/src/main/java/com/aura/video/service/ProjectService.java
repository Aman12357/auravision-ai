package com.aura.video.service;

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
