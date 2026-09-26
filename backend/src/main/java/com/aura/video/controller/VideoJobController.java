package com.aura.video.controller;

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
