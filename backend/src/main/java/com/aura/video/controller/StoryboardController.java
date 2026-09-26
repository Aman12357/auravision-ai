package com.aura.video.controller;

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
