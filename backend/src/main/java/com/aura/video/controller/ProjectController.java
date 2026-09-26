package com.aura.video.controller;

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
