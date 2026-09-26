package com.aura.video.controller;

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
