package com.aura.video.dto;
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
