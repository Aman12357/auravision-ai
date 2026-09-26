import os

base_path = r'C:\Users\ay670\.gemini\antigravity\scratch\aura-video-ai\backend\src\main\java\com\aura'

files = {
    # VIDEO CONTROLLERS
    'video/controller/ProjectController.java': '''package com.aura.video.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.entity.User;
import com.aura.video.dto.CreateProjectRequest;
import com.aura.video.dto.DashboardStatsDto;
import com.aura.video.dto.ProjectDto;
import com.aura.video.dto.UpdateProjectRequest;
import com.aura.video.service.ProjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name="Projects")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ApiResponse<ProjectDto> createProject(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                @AuthenticationPrincipal User user,
                                                @Valid @RequestBody CreateProjectRequest request) {
        return ApiResponse.success(projectService.createProject(workspaceId, user.getId(), request));
    }

    @GetMapping
    public ApiResponse<Page<ProjectDto>> getProjectsByWorkspace(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                                @AuthenticationPrincipal User user,
                                                                Pageable pageable) {
        return ApiResponse.success(projectService.getProjectsByWorkspace(workspaceId, user.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectDto> getProject(@PathVariable UUID id,
                                              @AuthenticationPrincipal User user) {
        return ApiResponse.success(projectService.getProject(id, user.getId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectDto> updateProject(@PathVariable UUID id,
                                                 @AuthenticationPrincipal User user,
                                                 @Valid @RequestBody UpdateProjectRequest request) {
        return ApiResponse.success(projectService.updateProject(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable UUID id,
                                           @AuthenticationPrincipal User user) {
        projectService.deleteProject(id, user.getId());
        return ApiResponse.success(null);
    }

    @GetMapping("/dashboard-stats")
    public ApiResponse<DashboardStatsDto> getDashboardStats(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                            @AuthenticationPrincipal User user) {
        return ApiResponse.success(projectService.getDashboardStats(workspaceId, user.getId()));
    }
}
''',
    'video/controller/VideoJobController.java': '''package com.aura.video.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.entity.User;
import com.aura.video.dto.VideoGenerationRequest;
import com.aura.video.dto.VideoJobDto;
import com.aura.video.service.VideoJobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@Tag(name="Video Jobs")
@RequiredArgsConstructor
public class VideoJobController {
    private final VideoJobService videoJobService;

    @PostMapping
    public ApiResponse<VideoJobDto> submitJob(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                              @AuthenticationPrincipal User user,
                                              @Valid @RequestBody VideoGenerationRequest request) {
        return ApiResponse.success(videoJobService.submitJob(workspaceId, user.getId(), request));
    }

    @GetMapping
    public ApiResponse<Page<VideoJobDto>> getJobsByWorkspace(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                             @AuthenticationPrincipal User user,
                                                             Pageable pageable) {
        return ApiResponse.success(videoJobService.getJobsByWorkspace(workspaceId, user.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<VideoJobDto> getJob(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(videoJobService.getJob(id, user.getId()));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<VideoJobDto> cancelJob(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(videoJobService.cancelJob(id, user.getId()));
    }

    @GetMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<VideoJobDto>> streamJobs(@AuthenticationPrincipal User user) {
        return videoJobService.getJobSseStream(user.getId());
    }
}
''',
    'video/controller/StoryboardController.java': '''package com.aura.video.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.entity.User;
import com.aura.video.dto.CreateSceneRequest;
import com.aura.video.dto.CreateStoryboardRequest;
import com.aura.video.dto.SceneDto;
import com.aura.video.dto.StoryboardDto;
import com.aura.video.service.StoryboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/storyboards")
@Tag(name="Storyboards")
@RequiredArgsConstructor
public class StoryboardController {
    private final StoryboardService storyboardService;

    @PostMapping
    public ApiResponse<StoryboardDto> createStoryboard(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody CreateStoryboardRequest request) {
        return ApiResponse.success(storyboardService.createStoryboard(request, user.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<StoryboardDto> getStoryboard(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(storyboardService.getStoryboard(id, user.getId()));
    }

    @PutMapping("/{id}/scenes/{sceneId}")
    public ApiResponse<SceneDto> updateScene(@PathVariable UUID id,
                                             @PathVariable UUID sceneId,
                                             @AuthenticationPrincipal User user,
                                             @Valid @RequestBody CreateSceneRequest request) {
        return ApiResponse.success(storyboardService.updateScene(sceneId, request, user.getId()));
    }

    @PostMapping("/generate")
    public ApiResponse<StoryboardDto> generateStoryboardFromPrompt(@AuthenticationPrincipal User user,
                                                                   @RequestBody Map<String, Object> payload) {
        String prompt = (String) payload.get("prompt");
        UUID projectId = UUID.fromString((String) payload.get("projectId"));
        return ApiResponse.success(storyboardService.generateStoryboardFromPrompt(prompt, projectId, user.getId()));
    }
}
''',
    'video/controller/VideoAssetController.java': '''package com.aura.video.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.entity.User;
import com.aura.video.dto.VideoAssetDto;
import com.aura.video.repository.VideoAssetRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
@Tag(name="Assets")
@RequiredArgsConstructor
public class VideoAssetController {
    private final VideoAssetRepository videoAssetRepository;

    @GetMapping
    public ApiResponse<Page<VideoAssetDto>> getAssetsByWorkspace(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                                 @AuthenticationPrincipal User user,
                                                                 Pageable pageable) {
        return ApiResponse.success(videoAssetRepository.findByWorkspaceId(workspaceId, pageable).map(VideoAssetDto::fromAsset));
    }

    @GetMapping("/{id}")
    public ApiResponse<VideoAssetDto> getAsset(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(VideoAssetDto.fromAsset(videoAssetRepository.findById(id).orElseThrow()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAsset(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        videoAssetRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/download")
    public ApiResponse<Map<String, String>> generateDownloadUrl(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        var asset = videoAssetRepository.findById(id).orElseThrow();
        asset.setDownloadCount(asset.getDownloadCount() + 1);
        videoAssetRepository.save(asset);
        // Normally calls StorageService to get presigned URL
        return ApiResponse.success(Map.of("downloadUrl", asset.getCdnUrl() != null ? asset.getCdnUrl() : "https://dummy-url.com"));
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
