package com.aura.video.dto;
import com.aura.video.entity.ProjectStatus;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProjectRequest(
    @Size(max = 200) String name,
    String description,
    ProjectStatus status,
    List<String> tags
) {}
