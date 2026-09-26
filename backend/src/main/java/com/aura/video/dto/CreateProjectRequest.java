package com.aura.video.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateProjectRequest(
    @NotBlank @Size(max = 200) String name,
    String description,
    List<String> tags
) {}
